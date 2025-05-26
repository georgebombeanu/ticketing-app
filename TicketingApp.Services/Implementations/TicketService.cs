using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TicketService : ITicketService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TicketService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    #region Basic CRUD Operations

    public async Task<TicketDto> GetByIdAsync(int id)
    {
        var ticket = await _unitOfWork.Tickets.GetTicketWithDetailsAsync(id);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        return _mapper.Map<TicketDto>(ticket);
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        var tickets = await _unitOfWork.Tickets.GetAllAsync();
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto createTicketDto, int createdByUserId)
    {
        var user = await _unitOfWork.Users.GetByIdAsync(createdByUserId);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found or inactive");

        var department = await _unitOfWork.Departments.GetByIdAsync(createTicketDto.DepartmentId);
        if (department == null || !department.IsActive)
            throw new ValidationException("Invalid department");

        if (createTicketDto.TeamId.HasValue)
        {
            var team = await _unitOfWork.Teams.GetByIdAsync(createTicketDto.TeamId.Value);
            if (team == null || !team.IsActive || team.DepartmentId != createTicketDto.DepartmentId)
                throw new ValidationException("Invalid team or team doesn't belong to the specified department");
        }

        var category = await _unitOfWork.TicketCategories.GetByIdAsync(createTicketDto.CategoryId);
        if (category == null || !category.IsActive)
            throw new ValidationException("Invalid ticket category");

        var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(createTicketDto.PriorityId);
        if (priority == null)
            throw new ValidationException("Invalid ticket priority");

        if (createTicketDto.AssignedToId.HasValue)
        {
            var assignedUser = await _unitOfWork.Users.GetByIdAsync(createTicketDto.AssignedToId.Value);
            if (assignedUser == null || !assignedUser.IsActive)
                throw new ValidationException("Invalid assigned user");
        }

        var defaultStatus = await _unitOfWork.TicketStatuses.GetByIdAsync(1);
        if (defaultStatus == null)
            throw new ValidationException("Default ticket status not found");

        var ticket = _mapper.Map<Ticket>(createTicketDto);
        ticket.CreatedById = createdByUserId;
        ticket.StatusId = defaultStatus.Id;
        ticket.CreatedAt = DateTime.UtcNow;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Tickets.AddAsync(ticket);
        await _unitOfWork.CompleteAsync();

        return await GetByIdAsync(ticket.Id);
    }

    public async Task<TicketDto> UpdateAsync(int id, UpdateTicketDto updateTicketDto, int updatedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(id);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var user = await _unitOfWork.Users.GetByIdAsync(updatedByUserId);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found or inactive");

        var category = await _unitOfWork.TicketCategories.GetByIdAsync(updateTicketDto.CategoryId);
        if (category == null || !category.IsActive)
            throw new ValidationException("Invalid ticket category");

        var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(updateTicketDto.PriorityId);
        if (priority == null)
            throw new ValidationException("Invalid ticket priority");

        var status = await _unitOfWork.TicketStatuses.GetByIdAsync(updateTicketDto.StatusId);
        if (status == null)
            throw new ValidationException("Invalid ticket status");

        if (updateTicketDto.AssignedToId.HasValue)
        {
            var assignedUser = await _unitOfWork.Users.GetByIdAsync(updateTicketDto.AssignedToId.Value);
            if (assignedUser == null || !assignedUser.IsActive)
                throw new ValidationException("Invalid assigned user");
        }

        _mapper.Map(updateTicketDto, ticket);
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        return await GetByIdAsync(ticket.Id);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(id);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        _unitOfWork.Tickets.Remove(ticket);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    #endregion

    #region Assignment Operations

    public async Task<TicketDto> AssignTicketAsync(int ticketId, int assignedToUserId, int assignedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var assignedUser = await _unitOfWork.Users.GetByIdAsync(assignedToUserId);
        if (assignedUser == null || !assignedUser.IsActive)
            throw new ValidationException("Invalid assigned user");

        ticket.AssignedToId = assignedToUserId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        await AddCommentAsync(ticketId, new CreateTicketCommentDto(
            ticketId,
            $"Ticket assigned to {assignedUser.FirstName} {assignedUser.LastName}",
            true
        ), assignedByUserId);

        return await GetByIdAsync(ticketId);
    }

    public async Task<TicketDto> UnassignTicketAsync(int ticketId, int unassignedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        ticket.AssignedToId = null;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        await AddCommentAsync(ticketId, new CreateTicketCommentDto(
            ticketId,
            "Ticket unassigned",
            true
        ), unassignedByUserId);

        return await GetByIdAsync(ticketId);
    }

    public async Task<TicketDto> ReassignTicketAsync(int ticketId, int newAssignedToUserId, int reassignedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var newAssignedUser = await _unitOfWork.Users.GetByIdAsync(newAssignedToUserId);
        if (newAssignedUser == null || !newAssignedUser.IsActive)
            throw new ValidationException("Invalid assigned user");

        var oldAssignedToId = ticket.AssignedToId;
        ticket.AssignedToId = newAssignedToUserId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        var comment = oldAssignedToId.HasValue
            ? $"Ticket reassigned to {newAssignedUser.FirstName} {newAssignedUser.LastName}"
            : $"Ticket assigned to {newAssignedUser.FirstName} {newAssignedUser.LastName}";

        await AddCommentAsync(ticketId, new CreateTicketCommentDto(
            ticketId,
            comment,
            true
        ), reassignedByUserId);

        return await GetByIdAsync(ticketId);
    }

    #endregion

    #region Status Operations

    public async Task<TicketDto> UpdateStatusAsync(int ticketId, int newStatusId, int updatedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var newStatus = await _unitOfWork.TicketStatuses.GetByIdAsync(newStatusId);
        if (newStatus == null)
            throw new ValidationException("Invalid ticket status");

        var oldStatusId = ticket.StatusId;
        ticket.StatusId = newStatusId;
        ticket.UpdatedAt = DateTime.UtcNow;

        if (IsClosedStatus(newStatus.Name))
        {
            ticket.ClosedAt = DateTime.UtcNow;
        }
        else if (ticket.ClosedAt.HasValue)
        {
            ticket.ClosedAt = null;
        }

        await _unitOfWork.CompleteAsync();

        await AddCommentAsync(ticketId, new CreateTicketCommentDto(
            ticketId,
            $"Status changed to {newStatus.Name}",
            true
        ), updatedByUserId);

        return await GetByIdAsync(ticketId);
    }

    public async Task<TicketDto> CloseTicketAsync(int ticketId, int closedByUserId)
    {
        var closedStatuses = await _unitOfWork.TicketStatuses.GetAllAsync();
        var closedStatus = closedStatuses.FirstOrDefault(s => 
            s.Name.ToLower().Contains("closed") || s.Name.ToLower().Contains("resolved"));
        
        if (closedStatus == null)
            throw new ValidationException("Closed status not found");

        return await UpdateStatusAsync(ticketId, closedStatus.Id, closedByUserId);
    }

    public async Task<TicketDto> ReopenTicketAsync(int ticketId, int reopenedByUserId)
    {
        var openStatuses = await _unitOfWork.TicketStatuses.GetAllAsync();
        var openStatus = openStatuses.FirstOrDefault(s => 
            s.Name.ToLower().Contains("open") || s.Name.ToLower().Contains("reopened"));
        
        if (openStatus == null)
            throw new ValidationException("Open status not found");

        return await UpdateStatusAsync(ticketId, openStatus.Id, reopenedByUserId);
    }

    #endregion

    #region Priority Operations

    public async Task<TicketDto> UpdatePriorityAsync(int ticketId, int newPriorityId, int updatedByUserId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var newPriority = await _unitOfWork.TicketPriorities.GetByIdAsync(newPriorityId);
        if (newPriority == null)
            throw new ValidationException("Invalid ticket priority");

        ticket.PriorityId = newPriorityId;
        ticket.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CompleteAsync();

        // Add a comment about the priority change
        await AddCommentAsync(ticketId, new CreateTicketCommentDto(
            ticketId,
            $"Priority changed to {newPriority.Name}",
            true
        ), updatedByUserId);

        return await GetByIdAsync(ticketId);
    }

    #endregion

    #region Filtering and Searching

    public async Task<IEnumerable<TicketDto>> GetTicketsByUserAsync(int userId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByUserAsync(userId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsAssignedToUserAsync(int userId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsAssignedToUserAsync(userId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByDepartmentAsync(int departmentId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByDepartmentAsync(departmentId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByTeamAsync(int teamId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByTeamAsync(teamId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByStatusAsync(int statusId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByStatusAsync(statusId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByPriorityAsync(int priorityId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByPriorityAsync(priorityId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByCategoryAsync(int categoryId)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsByCategoryAsync(categoryId);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetActiveTicketsAsync()
    {
        var tickets = await _unitOfWork.Tickets.GetActiveTicketsAsync();
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsCreatedBetweenDatesAsync(DateTime startDate, DateTime endDate)
    {
        var tickets = await _unitOfWork.Tickets.GetTicketsCreatedBetweenDatesAsync(startDate, endDate);
        return _mapper.Map<IEnumerable<TicketDto>>(tickets);
    }

    #endregion

    #region Comments

    public async Task<TicketCommentDto> AddCommentAsync(int ticketId, CreateTicketCommentDto commentDto, int userId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found or inactive");

        var comment = _mapper.Map<TicketComment>(commentDto);
        comment.UserId = userId;
        comment.CreatedAt = DateTime.UtcNow;

        await _unitOfWork.TicketComments.AddAsync(comment);
        await _unitOfWork.CompleteAsync();

        ticket.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.CompleteAsync();

        var savedComment = await _unitOfWork.TicketComments.GetCommentWithUserAsync(comment.Id);
        return _mapper.Map<TicketCommentDto>(savedComment);
    }

    public async Task<IEnumerable<TicketCommentDto>> GetTicketCommentsAsync(int ticketId, bool includeInternal = false)
    {
        var comments = includeInternal
            ? await _unitOfWork.TicketComments.GetCommentsByTicketAsync(ticketId)
            : (await _unitOfWork.TicketComments.GetCommentsByTicketAsync(ticketId))
                .Where(c => !c.IsInternal);

        return _mapper.Map<IEnumerable<TicketCommentDto>>(comments);
    }

    #endregion

    #region Attachments

    public async Task<TicketAttachmentDto> AddAttachmentAsync(CreateTicketAttachmentDto attachmentDto, int userId)
    {
        var ticket = await _unitOfWork.Tickets.GetByIdAsync(attachmentDto.TicketId);
        if (ticket == null)
            throw new NotFoundException("Ticket not found");

        var user = await _unitOfWork.Users.GetByIdAsync(userId);
        if (user == null || !user.IsActive)
            throw new NotFoundException("User not found or inactive");

        var attachment = _mapper.Map<TicketAttachment>(attachmentDto);
        attachment.UserId = userId;
        attachment.UploadedAt = DateTime.UtcNow;

        await _unitOfWork.TicketAttachments.AddAsync(attachment);
        await _unitOfWork.CompleteAsync();

        ticket.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.CompleteAsync();

        var savedAttachment = await _unitOfWork.TicketAttachments.GetAttachmentWithDetailsAsync(attachment.Id);
        return _mapper.Map<TicketAttachmentDto>(savedAttachment);
    }

    public async Task<IEnumerable<TicketAttachmentDto>> GetTicketAttachmentsAsync(int ticketId)
    {
        var attachments = await _unitOfWork.TicketAttachments.GetAttachmentsByTicketAsync(ticketId);
        return _mapper.Map<IEnumerable<TicketAttachmentDto>>(attachments);
    }

    public async Task<bool> RemoveAttachmentAsync(int attachmentId, int userId)
    {
        var attachment = await _unitOfWork.TicketAttachments.GetByIdAsync(attachmentId);
        if (attachment == null)
            throw new NotFoundException("Attachment not found");

        // Optional: Check if user has permission to delete (e.g., only owner or admin)
        // if (attachment.UserId != userId && !IsAdmin(userId))
        //     throw new UnauthorizedException("Permission denied");

        _unitOfWork.TicketAttachments.Remove(attachment);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    #endregion

    #region Analytics and Reporting

    public async Task<int> GetActiveTicketsCountAsync()
    {
        return await _unitOfWork.Tickets.CountAsync(t => !t.ClosedAt.HasValue);
    }

    public async Task<int> GetTicketsCountByStatusAsync(int statusId)
    {
        return await _unitOfWork.Tickets.CountAsync(t => t.StatusId == statusId);
    }

    public async Task<int> GetTicketsCountByUserAsync(int userId)
    {
        return await _unitOfWork.Tickets.CountAsync(t => t.CreatedById == userId);
    }

    public async Task<int> GetTicketsCountByDepartmentAsync(int departmentId)
    {
        return await _unitOfWork.Tickets.CountAsync(t => t.DepartmentId == departmentId);
    }

    #endregion

    #region Private Helper Methods

    private static bool IsClosedStatus(string statusName)
    {
        var closedKeywords = new[] { "closed", "resolved", "completed", "done" };
        return closedKeywords.Any(keyword => statusName.ToLower().Contains(keyword));
    }

    #endregion
}