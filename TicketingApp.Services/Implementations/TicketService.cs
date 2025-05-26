using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.Extensions.Logging;
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
    private readonly ILogger<TicketService> _logger;

    public TicketService(IUnitOfWork unitOfWork, IMapper mapper, ILogger<TicketService> logger)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _logger = logger;
    }

    #region Basic CRUD Operations

    public async Task<TicketDto> GetByIdAsync(int id)
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve ticket with ID: {TicketId}", id);

            var ticket = await _unitOfWork.Tickets.GetTicketWithDetailsAsync(id);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found with ID: {TicketId}", id);
                throw new NotFoundException($"Ticket not found with ID: {id}");
            }

            _logger.LogInformation("Successfully retrieved ticket with ID: {TicketId}", id);
            return _mapper.Map<TicketDto>(ticket);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error retrieving ticket with ID: {TicketId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Attempting to retrieve all tickets");

            var tickets = await _unitOfWork.Tickets.GetAllTicketsWithDetailsAsync();

            _logger.LogInformation("Successfully retrieved {TicketCount} tickets", tickets.Count());
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all tickets");
            throw;
        }
    }

    public async Task<TicketDto> CreateAsync(CreateTicketDto createTicketDto, int createdByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to create ticket for user: {UserId}", createdByUserId);
            _logger.LogDebug("Ticket creation data: {@CreateTicketDto}", createTicketDto);

            // Validate user exists
            _logger.LogDebug("Validating user exists: {UserId}", createdByUserId);
            var user = await _unitOfWork.Users.GetByIdAsync(createdByUserId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive: {UserId}", createdByUserId);
                throw new NotFoundException("User not found or inactive");
            }

            // Validate department exists
            _logger.LogDebug("Validating department exists: {DepartmentId}", createTicketDto.DepartmentId);
            var department = await _unitOfWork.Departments.GetByIdAsync(createTicketDto.DepartmentId);
            if (department == null || !department.IsActive)
            {
                _logger.LogWarning("Department not found or inactive: {DepartmentId}", createTicketDto.DepartmentId);
                throw new ValidationException("Invalid department");
            }

            // Validate team if provided
            if (createTicketDto.TeamId.HasValue)
            {
                _logger.LogDebug("Validating team exists: {TeamId}", createTicketDto.TeamId.Value);
                var team = await _unitOfWork.Teams.GetByIdAsync(createTicketDto.TeamId.Value);
                if (team == null || !team.IsActive || team.DepartmentId != createTicketDto.DepartmentId)
                {
                    _logger.LogWarning("Team not found, inactive, or doesn't belong to department. TeamId: {TeamId}, DepartmentId: {DepartmentId}",
                        createTicketDto.TeamId.Value, createTicketDto.DepartmentId);
                    throw new ValidationException("Invalid team or team doesn't belong to the specified department");
                }
            }

            // Validate category
            _logger.LogDebug("Validating category exists: {CategoryId}", createTicketDto.CategoryId);
            var category = await _unitOfWork.TicketCategories.GetByIdAsync(createTicketDto.CategoryId);
            if (category == null || !category.IsActive)
            {
                _logger.LogWarning("Category not found or inactive: {CategoryId}", createTicketDto.CategoryId);
                throw new ValidationException("Invalid ticket category");
            }

            // Validate priority
            _logger.LogDebug("Validating priority exists: {PriorityId}", createTicketDto.PriorityId);
            var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(createTicketDto.PriorityId);
            if (priority == null)
            {
                _logger.LogWarning("Priority not found: {PriorityId}", createTicketDto.PriorityId);
                throw new ValidationException("Invalid ticket priority");
            }

            // Validate assigned user if provided
            if (createTicketDto.AssignedToId.HasValue)
            {
                _logger.LogDebug("Validating assigned user exists: {AssignedToId}", createTicketDto.AssignedToId.Value);
                var assignedUser = await _unitOfWork.Users.GetByIdAsync(createTicketDto.AssignedToId.Value);
                if (assignedUser == null || !assignedUser.IsActive)
                {
                    _logger.LogWarning("Assigned user not found or inactive: {AssignedToId}", createTicketDto.AssignedToId.Value);
                    throw new ValidationException("Invalid assigned user");
                }
            }

            // Get default "Open" status
            _logger.LogDebug("Getting default status for new ticket");
            var allStatuses = await _unitOfWork.TicketStatuses.GetAllAsync();
            var defaultStatus = allStatuses.FirstOrDefault(s => s.Name.ToLower().Contains("open"))
                               ?? allStatuses.FirstOrDefault();

            if (defaultStatus == null)
            {
                _logger.LogError("No ticket status found in the system");
                throw new ValidationException("No ticket status found in the system");
            }

            _logger.LogDebug("Using default status: {StatusName} (ID: {StatusId})", defaultStatus.Name, defaultStatus.Id);

            // Create ticket
            var ticket = _mapper.Map<Ticket>(createTicketDto);
            ticket.CreatedById = createdByUserId;
            ticket.StatusId = defaultStatus.Id;
            ticket.CreatedAt = DateTime.UtcNow;
            ticket.UpdatedAt = DateTime.UtcNow;

            _logger.LogDebug("Adding ticket to database");
            await _unitOfWork.Tickets.AddAsync(ticket);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Successfully created ticket with ID: {TicketId} for user: {UserId}", ticket.Id, createdByUserId);

            return await GetByIdAsync(ticket.Id);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error creating ticket for user: {UserId}. Data: {@CreateTicketDto}", createdByUserId, createTicketDto);
            throw;
        }
    }

    public async Task<TicketDto> UpdateAsync(int id, UpdateTicketDto updateTicketDto, int updatedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to update ticket {TicketId} by user {UserId}", id, updatedByUserId);
            _logger.LogDebug("Update data: {@UpdateTicketDto}", updateTicketDto);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(id);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for update: {TicketId}", id);
                throw new NotFoundException("Ticket not found");
            }

            // Validate user permissions
            var user = await _unitOfWork.Users.GetByIdAsync(updatedByUserId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive for update: {UserId}", updatedByUserId);
                throw new NotFoundException("User not found or inactive");
            }

            // Validate category
            var category = await _unitOfWork.TicketCategories.GetByIdAsync(updateTicketDto.CategoryId);
            if (category == null || !category.IsActive)
            {
                _logger.LogWarning("Invalid category for update: {CategoryId}", updateTicketDto.CategoryId);
                throw new ValidationException("Invalid ticket category");
            }

            // Validate priority
            var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(updateTicketDto.PriorityId);
            if (priority == null)
            {
                _logger.LogWarning("Invalid priority for update: {PriorityId}", updateTicketDto.PriorityId);
                throw new ValidationException("Invalid ticket priority");
            }

            // Validate status
            var status = await _unitOfWork.TicketStatuses.GetByIdAsync(updateTicketDto.StatusId);
            if (status == null)
            {
                _logger.LogWarning("Invalid status for update: {StatusId}", updateTicketDto.StatusId);
                throw new ValidationException("Invalid ticket status");
            }

            // Validate assigned user if provided
            if (updateTicketDto.AssignedToId.HasValue)
            {
                var assignedUser = await _unitOfWork.Users.GetByIdAsync(updateTicketDto.AssignedToId.Value);
                if (assignedUser == null || !assignedUser.IsActive)
                {
                    _logger.LogWarning("Invalid assigned user for update: {AssignedToId}", updateTicketDto.AssignedToId.Value);
                    throw new ValidationException("Invalid assigned user");
                }
            }

            // Update ticket properties
            _mapper.Map(updateTicketDto, ticket);
            ticket.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Successfully updated ticket {TicketId} by user {UserId}", id, updatedByUserId);

            return await GetByIdAsync(ticket.Id);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error updating ticket {TicketId} by user {UserId}", id, updatedByUserId);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(int id)
    {
        try
        {
            _logger.LogInformation("Attempting to delete ticket: {TicketId}", id);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(id);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for deletion: {TicketId}", id);
                throw new NotFoundException("Ticket not found");
            }

            _unitOfWork.Tickets.Remove(ticket);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Successfully deleted ticket: {TicketId}", id);
            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error deleting ticket: {TicketId}", id);
            throw;
        }
    }

    #endregion

    #region Assignment Operations

    public async Task<TicketDto> AssignTicketAsync(int ticketId, int assignedToUserId, int assignedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to assign ticket {TicketId} to user {AssignedToUserId} by user {AssignedByUserId}",
                ticketId, assignedToUserId, assignedByUserId);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for assignment: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var assignedUser = await _unitOfWork.Users.GetByIdAsync(assignedToUserId);
            if (assignedUser == null || !assignedUser.IsActive)
            {
                _logger.LogWarning("Assigned user not found or inactive: {AssignedToUserId}", assignedToUserId);
                throw new ValidationException("Invalid assigned user");
            }

            ticket.AssignedToId = assignedToUserId;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            // Add a comment about the assignment
            await AddCommentAsync(ticketId, new CreateTicketCommentDto(
                ticketId,
                $"Ticket assigned to {assignedUser.FirstName} {assignedUser.LastName}",
                true // Internal comment
            ), assignedByUserId);

            _logger.LogInformation("Successfully assigned ticket {TicketId} to user {AssignedToUserId}", ticketId, assignedToUserId);
            return await GetByIdAsync(ticketId);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error assigning ticket {TicketId} to user {AssignedToUserId}", ticketId, assignedToUserId);
            throw;
        }
    }

    public async Task<TicketDto> UnassignTicketAsync(int ticketId, int unassignedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to unassign ticket {TicketId} by user {UnassignedByUserId}",
                ticketId, unassignedByUserId);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for unassignment: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var previousAssignedUserId = ticket.AssignedToId;
            ticket.AssignedToId = null;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            // Add a comment about the unassignment
            await AddCommentAsync(ticketId, new CreateTicketCommentDto(
                ticketId,
                "Ticket unassigned",
                true // Internal comment
            ), unassignedByUserId);

            _logger.LogInformation("Successfully unassigned ticket {TicketId} (was assigned to user {PreviousAssignedUserId})",
                ticketId, previousAssignedUserId);
            return await GetByIdAsync(ticketId);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error unassigning ticket {TicketId}", ticketId);
            throw;
        }
    }

    public async Task<TicketDto> ReassignTicketAsync(int ticketId, int newAssignedToUserId, int reassignedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to reassign ticket {TicketId} to user {NewAssignedToUserId} by user {ReassignedByUserId}",
                ticketId, newAssignedToUserId, reassignedByUserId);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for reassignment: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var newAssignedUser = await _unitOfWork.Users.GetByIdAsync(newAssignedToUserId);
            if (newAssignedUser == null || !newAssignedUser.IsActive)
            {
                _logger.LogWarning("New assigned user not found or inactive: {NewAssignedToUserId}", newAssignedToUserId);
                throw new ValidationException("Invalid assigned user");
            }

            var oldAssignedToId = ticket.AssignedToId;
            ticket.AssignedToId = newAssignedToUserId;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            // Add a comment about the reassignment
            var comment = oldAssignedToId.HasValue
                ? $"Ticket reassigned to {newAssignedUser.FirstName} {newAssignedUser.LastName}"
                : $"Ticket assigned to {newAssignedUser.FirstName} {newAssignedUser.LastName}";

            await AddCommentAsync(ticketId, new CreateTicketCommentDto(
                ticketId,
                comment,
                true // Internal comment
            ), reassignedByUserId);

            _logger.LogInformation("Successfully reassigned ticket {TicketId} from user {OldAssignedToId} to user {NewAssignedToUserId}",
                ticketId, oldAssignedToId, newAssignedToUserId);
            return await GetByIdAsync(ticketId);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error reassigning ticket {TicketId} to user {NewAssignedToUserId}", ticketId, newAssignedToUserId);
            throw;
        }
    }

    #endregion

    #region Status Operations

    public async Task<TicketDto> UpdateStatusAsync(int ticketId, int newStatusId, int updatedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to update status of ticket {TicketId} to status {NewStatusId} by user {UpdatedByUserId}",
                ticketId, newStatusId, updatedByUserId);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for status update: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var newStatus = await _unitOfWork.TicketStatuses.GetByIdAsync(newStatusId);
            if (newStatus == null)
            {
                _logger.LogWarning("Status not found: {NewStatusId}", newStatusId);
                throw new ValidationException("Invalid ticket status");
            }

            var oldStatusId = ticket.StatusId;
            ticket.StatusId = newStatusId;
            ticket.UpdatedAt = DateTime.UtcNow;

            // If status indicates closed, set ClosedAt
            if (IsClosedStatus(newStatus.Name))
            {
                ticket.ClosedAt = DateTime.UtcNow;
                _logger.LogDebug("Ticket {TicketId} marked as closed", ticketId);
            }
            else if (ticket.ClosedAt.HasValue) // Reopening
            {
                ticket.ClosedAt = null;
                _logger.LogDebug("Ticket {TicketId} reopened (ClosedAt reset)", ticketId);
            }

            await _unitOfWork.CompleteAsync();

            // Add a comment about the status change
            await AddCommentAsync(ticketId, new CreateTicketCommentDto(
                ticketId,
                $"Status changed to {newStatus.Name}",
                true // Internal comment
            ), updatedByUserId);

            _logger.LogInformation("Successfully updated status of ticket {TicketId} from {OldStatusId} to {NewStatusId}",
                ticketId, oldStatusId, newStatusId);
            return await GetByIdAsync(ticketId);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error updating status of ticket {TicketId} to status {NewStatusId}", ticketId, newStatusId);
            throw;
        }
    }

    public async Task<TicketDto> CloseTicketAsync(int ticketId, int closedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to close ticket {TicketId} by user {ClosedByUserId}", ticketId, closedByUserId);

            // Assuming there's a "Closed" status with a specific ID or name
            var closedStatuses = await _unitOfWork.TicketStatuses.GetAllAsync();
            var closedStatus = closedStatuses.FirstOrDefault(s =>
                s.Name.ToLower().Contains("closed") || s.Name.ToLower().Contains("resolved"));

            if (closedStatus == null)
            {
                _logger.LogError("No closed status found in the system");
                throw new ValidationException("Closed status not found");
            }

            _logger.LogDebug("Using closed status: {StatusName} (ID: {StatusId})", closedStatus.Name, closedStatus.Id);
            return await UpdateStatusAsync(ticketId, closedStatus.Id, closedByUserId);
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogError(ex, "Error closing ticket {TicketId}", ticketId);
            throw;
        }
    }

    public async Task<TicketDto> ReopenTicketAsync(int ticketId, int reopenedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to reopen ticket {TicketId} by user {ReopenedByUserId}", ticketId, reopenedByUserId);

            // Assuming there's an "Open" or "Reopened" status
            var openStatuses = await _unitOfWork.TicketStatuses.GetAllAsync();
            var openStatus = openStatuses.FirstOrDefault(s =>
                s.Name.ToLower().Contains("open") || s.Name.ToLower().Contains("reopened"));

            if (openStatus == null)
            {
                _logger.LogError("No open status found in the system");
                throw new ValidationException("Open status not found");
            }

            _logger.LogDebug("Using open status: {StatusName} (ID: {StatusId})", openStatus.Name, openStatus.Id);
            return await UpdateStatusAsync(ticketId, openStatus.Id, reopenedByUserId);
        }
        catch (Exception ex) when (!(ex is ValidationException))
        {
            _logger.LogError(ex, "Error reopening ticket {TicketId}", ticketId);
            throw;
        }
    }

    #endregion

    #region Priority Operations

    public async Task<TicketDto> UpdatePriorityAsync(int ticketId, int newPriorityId, int updatedByUserId)
    {
        try
        {
            _logger.LogInformation("Attempting to update priority of ticket {TicketId} to priority {NewPriorityId} by user {UpdatedByUserId}",
                ticketId, newPriorityId, updatedByUserId);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for priority update: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var newPriority = await _unitOfWork.TicketPriorities.GetByIdAsync(newPriorityId);
            if (newPriority == null)
            {
                _logger.LogWarning("Priority not found: {NewPriorityId}", newPriorityId);
                throw new ValidationException("Invalid ticket priority");
            }

            var oldPriorityId = ticket.PriorityId;
            ticket.PriorityId = newPriorityId;
            ticket.UpdatedAt = DateTime.UtcNow;

            await _unitOfWork.CompleteAsync();

            // Add a comment about the priority change
            await AddCommentAsync(ticketId, new CreateTicketCommentDto(
                ticketId,
                $"Priority changed to {newPriority.Name}",
                true // Internal comment
            ), updatedByUserId);

            _logger.LogInformation("Successfully updated priority of ticket {TicketId} from {OldPriorityId} to {NewPriorityId}",
                ticketId, oldPriorityId, newPriorityId);
            return await GetByIdAsync(ticketId);
        }
        catch (Exception ex) when (!(ex is ValidationException || ex is NotFoundException))
        {
            _logger.LogError(ex, "Error updating priority of ticket {TicketId} to priority {NewPriorityId}", ticketId, newPriorityId);
            throw;
        }
    }

    #endregion

    #region Filtering and Searching

    public async Task<IEnumerable<TicketDto>> GetTicketsByUserAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets created by user {UserId}", userId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByUserAsync(userId);
            _logger.LogInformation("Retrieved {Count} tickets for user {UserId}", tickets.Count(), userId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsAssignedToUserAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets assigned to user {UserId}", userId);
            var tickets = await _unitOfWork.Tickets.GetTicketsAssignedToUserAsync(userId);
            _logger.LogInformation("Retrieved {Count} assigned tickets for user {UserId}", tickets.Count(), userId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving assigned tickets for user {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByDepartmentAsync(int departmentId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets for department {DepartmentId}", departmentId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByDepartmentAsync(departmentId);
            _logger.LogInformation("Retrieved {Count} tickets for department {DepartmentId}", tickets.Count(), departmentId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets for department {DepartmentId}", departmentId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByTeamAsync(int teamId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets for team {TeamId}", teamId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByTeamAsync(teamId);
            _logger.LogInformation("Retrieved {Count} tickets for team {TeamId}", tickets.Count(), teamId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets for team {TeamId}", teamId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByStatusAsync(int statusId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets with status {StatusId}", statusId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByStatusAsync(statusId);
            _logger.LogInformation("Retrieved {Count} tickets with status {StatusId}", tickets.Count(), statusId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets with status {StatusId}", statusId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByPriorityAsync(int priorityId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets with priority {PriorityId}", priorityId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByPriorityAsync(priorityId);
            _logger.LogInformation("Retrieved {Count} tickets with priority {PriorityId}", tickets.Count(), priorityId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets with priority {PriorityId}", priorityId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsByCategoryAsync(int categoryId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets with category {CategoryId}", categoryId);
            var tickets = await _unitOfWork.Tickets.GetTicketsByCategoryAsync(categoryId);
            _logger.LogInformation("Retrieved {Count} tickets with category {CategoryId}", tickets.Count(), categoryId);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets with category {CategoryId}", categoryId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetActiveTicketsAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving active tickets");
            var tickets = await _unitOfWork.Tickets.GetActiveTicketsAsync();
            _logger.LogInformation("Retrieved {Count} active tickets", tickets.Count());
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active tickets");
            throw;
        }
    }

    public async Task<IEnumerable<TicketDto>> GetTicketsCreatedBetweenDatesAsync(DateTime startDate, DateTime endDate)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets created between {StartDate} and {EndDate}", startDate, endDate);
            var tickets = await _unitOfWork.Tickets.GetTicketsCreatedBetweenDatesAsync(startDate, endDate);
            _logger.LogInformation("Retrieved {Count} tickets created between {StartDate} and {EndDate}",
                tickets.Count(), startDate, endDate);
            return _mapper.Map<IEnumerable<TicketDto>>(tickets);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets created between {StartDate} and {EndDate}", startDate, endDate);
            throw;
        }
    }

    #endregion

    #region Comments

    public async Task<TicketCommentDto> AddCommentAsync(int ticketId, CreateTicketCommentDto commentDto, int userId)
    {
        try
        {
            _logger.LogInformation("Attempting to add comment to ticket {TicketId} by user {UserId}", ticketId, userId);
            _logger.LogDebug("Comment data: {@CommentDto}", commentDto);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(ticketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for comment: {TicketId}", ticketId);
                throw new NotFoundException("Ticket not found");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive for comment: {UserId}", userId);
                throw new NotFoundException("User not found or inactive");
            }

            var comment = _mapper.Map<TicketComment>(commentDto);
            comment.UserId = userId;
            comment.CreatedAt = DateTime.UtcNow;

            await _unitOfWork.TicketComments.AddAsync(comment);
            await _unitOfWork.CompleteAsync();

            // Update ticket's UpdatedAt timestamp
            ticket.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.CompleteAsync();

            var savedComment = await _unitOfWork.TicketComments.GetCommentWithUserAsync(comment.Id);

            _logger.LogInformation("Successfully added comment {CommentId} to ticket {TicketId} by user {UserId}",
                comment.Id, ticketId, userId);
            return _mapper.Map<TicketCommentDto>(savedComment);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error adding comment to ticket {TicketId} by user {UserId}", ticketId, userId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketCommentDto>> GetTicketCommentsAsync(int ticketId, bool includeInternal = false)
    {
        try
        {
            _logger.LogInformation("Retrieving comments for ticket {TicketId} (includeInternal: {IncludeInternal})",
                ticketId, includeInternal);

            var comments = includeInternal
                ? await _unitOfWork.TicketComments.GetCommentsByTicketAsync(ticketId)
                : (await _unitOfWork.TicketComments.GetCommentsByTicketAsync(ticketId))
                    .Where(c => !c.IsInternal);

            _logger.LogInformation("Retrieved {Count} comments for ticket {TicketId}", comments.Count(), ticketId);
            return _mapper.Map<IEnumerable<TicketCommentDto>>(comments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving comments for ticket {TicketId}", ticketId);
            throw;
        }
    }

    #endregion

    #region Attachments

    public async Task<TicketAttachmentDto> AddAttachmentAsync(CreateTicketAttachmentDto attachmentDto, int userId)
    {
        try
        {
            _logger.LogInformation("Attempting to add attachment to ticket {TicketId} by user {UserId}",
                attachmentDto.TicketId, userId);
            _logger.LogDebug("Attachment data: {@AttachmentDto}", attachmentDto);

            var ticket = await _unitOfWork.Tickets.GetByIdAsync(attachmentDto.TicketId);
            if (ticket == null)
            {
                _logger.LogWarning("Ticket not found for attachment: {TicketId}", attachmentDto.TicketId);
                throw new NotFoundException("Ticket not found");
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null || !user.IsActive)
            {
                _logger.LogWarning("User not found or inactive for attachment: {UserId}", userId);
                throw new NotFoundException("User not found or inactive");
            }

            var attachment = _mapper.Map<TicketAttachment>(attachmentDto);
            attachment.UserId = userId;
            attachment.UploadedAt = DateTime.UtcNow;

            await _unitOfWork.TicketAttachments.AddAsync(attachment);
            await _unitOfWork.CompleteAsync();

            // Update ticket's UpdatedAt timestamp
            ticket.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.CompleteAsync();

            var savedAttachment = await _unitOfWork.TicketAttachments.GetAttachmentWithDetailsAsync(attachment.Id);

            _logger.LogInformation("Successfully added attachment {AttachmentId} to ticket {TicketId} by user {UserId}",
                attachment.Id, attachmentDto.TicketId, userId);
            return _mapper.Map<TicketAttachmentDto>(savedAttachment);
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error adding attachment to ticket {TicketId} by user {UserId}",
                attachmentDto.TicketId, userId);
            throw;
        }
    }

    public async Task<IEnumerable<TicketAttachmentDto>> GetTicketAttachmentsAsync(int ticketId)
    {
        try
        {
            _logger.LogInformation("Retrieving attachments for ticket {TicketId}", ticketId);
            var attachments = await _unitOfWork.TicketAttachments.GetAttachmentsByTicketAsync(ticketId);
            _logger.LogInformation("Retrieved {Count} attachments for ticket {TicketId}", attachments.Count(), ticketId);
            return _mapper.Map<IEnumerable<TicketAttachmentDto>>(attachments);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving attachments for ticket {TicketId}", ticketId);
            throw;
        }
    }

    public async Task<bool> RemoveAttachmentAsync(int attachmentId, int userId)
    {
        try
        {
            _logger.LogInformation("Attempting to remove attachment {AttachmentId} by user {UserId}", attachmentId, userId);

            var attachment = await _unitOfWork.TicketAttachments.GetByIdAsync(attachmentId);
            if (attachment == null)
            {
                _logger.LogWarning("Attachment not found: {AttachmentId}", attachmentId);
                throw new NotFoundException("Attachment not found");
            }

            // Optional: Check if user has permission to delete (e.g., only owner or admin)
            // if (attachment.UserId != userId && !IsAdmin(userId))
            //     throw new UnauthorizedException("Permission denied");

            _unitOfWork.TicketAttachments.Remove(attachment);
            await _unitOfWork.CompleteAsync();

            _logger.LogInformation("Successfully removed attachment {AttachmentId} by user {UserId}", attachmentId, userId);
            return true;
        }
        catch (Exception ex) when (!(ex is NotFoundException))
        {
            _logger.LogError(ex, "Error removing attachment {AttachmentId} by user {UserId}", attachmentId, userId);
            throw;
        }
    }

    #endregion

    #region Analytics and Reporting

    public async Task<int> GetActiveTicketsCountAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving active tickets count");
            var count = await _unitOfWork.Tickets.CountAsync(t => !t.ClosedAt.HasValue);
            _logger.LogInformation("Active tickets count: {Count}", count);
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active tickets count");
            throw;
        }
    }

    public async Task<int> GetTicketsCountByStatusAsync(int statusId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets count for status {StatusId}", statusId);
            var count = await _unitOfWork.Tickets.CountAsync(t => t.StatusId == statusId);
            _logger.LogInformation("Tickets count for status {StatusId}: {Count}", statusId, count);
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets count for status {StatusId}", statusId);
            throw;
        }
    }

    public async Task<int> GetTicketsCountByUserAsync(int userId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets count for user {UserId}", userId);
            var count = await _unitOfWork.Tickets.CountAsync(t => t.CreatedById == userId);
            _logger.LogInformation("Tickets count for user {UserId}: {Count}", userId, count);
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets count for user {UserId}", userId);
            throw;
        }
    }

    public async Task<int> GetTicketsCountByDepartmentAsync(int departmentId)
    {
        try
        {
            _logger.LogInformation("Retrieving tickets count for department {DepartmentId}", departmentId);
            var count = await _unitOfWork.Tickets.CountAsync(t => t.DepartmentId == departmentId);
            _logger.LogInformation("Tickets count for department {DepartmentId}: {Count}", departmentId, count);
            return count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tickets count for department {DepartmentId}", departmentId);
            throw;
        }
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