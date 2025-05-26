using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Interfaces;

public interface ITicketService
{
    Task<TicketDto> GetByIdAsync(int id);
    Task<IEnumerable<TicketDto>> GetAllAsync();
    Task<TicketDto> CreateAsync(CreateTicketDto createTicketDto, int createdByUserId);
    Task<TicketDto> UpdateAsync(int id, UpdateTicketDto updateTicketDto, int updatedByUserId);
    Task<bool> DeleteAsync(int id);

    Task<TicketDto> AssignTicketAsync(int ticketId, int assignedToUserId, int assignedByUserId);
    Task<TicketDto> UnassignTicketAsync(int ticketId, int unassignedByUserId);
    Task<TicketDto> ReassignTicketAsync(int ticketId, int newAssignedToUserId, int reassignedByUserId);

    Task<TicketDto> UpdateStatusAsync(int ticketId, int newStatusId, int updatedByUserId);
    Task<TicketDto> CloseTicketAsync(int ticketId, int closedByUserId);
    Task<TicketDto> ReopenTicketAsync(int ticketId, int reopenedByUserId);

    Task<TicketDto> UpdatePriorityAsync(int ticketId, int newPriorityId, int updatedByUserId);

    Task<IEnumerable<TicketDto>> GetTicketsByUserAsync(int userId);
    Task<IEnumerable<TicketDto>> GetTicketsAssignedToUserAsync(int userId);
    Task<IEnumerable<TicketDto>> GetTicketsByDepartmentAsync(int departmentId);
    Task<IEnumerable<TicketDto>> GetTicketsByTeamAsync(int teamId);
    Task<IEnumerable<TicketDto>> GetTicketsByStatusAsync(int statusId);
    Task<IEnumerable<TicketDto>> GetTicketsByPriorityAsync(int priorityId);
    Task<IEnumerable<TicketDto>> GetTicketsByCategoryAsync(int categoryId);
    Task<IEnumerable<TicketDto>> GetActiveTicketsAsync();
    Task<IEnumerable<TicketDto>> GetTicketsCreatedBetweenDatesAsync(DateTime startDate, DateTime endDate);

    Task<TicketCommentDto> AddCommentAsync(int ticketId, CreateTicketCommentDto commentDto, int userId);
    Task<IEnumerable<TicketCommentDto>> GetTicketCommentsAsync(int ticketId, bool includeInternal = false);

    Task<TicketAttachmentDto> AddAttachmentAsync(CreateTicketAttachmentDto attachmentDto, int userId);
    Task<IEnumerable<TicketAttachmentDto>> GetTicketAttachmentsAsync(int ticketId);
    Task<bool> RemoveAttachmentAsync(int attachmentId, int userId);

    Task<int> GetActiveTicketsCountAsync();
    Task<int> GetTicketsCountByStatusAsync(int statusId);
    Task<int> GetTicketsCountByUserAsync(int userId);
    Task<int> GetTicketsCountByDepartmentAsync(int departmentId);
}