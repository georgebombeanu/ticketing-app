using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TicketStatusService : ITicketStatusService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TicketStatusService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TicketStatusDto> GetByIdAsync(int id)
    {
        var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
        if (status == null)
            throw new NotFoundException("Ticket status not found");

        return _mapper.Map<TicketStatusDto>(status);
    }

    public async Task<IEnumerable<TicketStatusDto>> GetAllAsync()
    {
        var statuses = await _unitOfWork.TicketStatuses.GetAllAsync();
        return _mapper.Map<IEnumerable<TicketStatusDto>>(statuses);
    }

    public async Task<IEnumerable<TicketStatusDto>> GetAllOrderedByNameAsync()
    {
        var statuses = await _unitOfWork.TicketStatuses.GetAllOrderedByNameAsync();
        return _mapper.Map<IEnumerable<TicketStatusDto>>(statuses);
    }

    public async Task<TicketStatusDto> CreateAsync(CreateTicketStatusDto createStatusDto)
    {
        if (!await IsStatusNameUniqueAsync(createStatusDto.Name))
            throw new ValidationException("Status name already exists");

        var status = _mapper.Map<TicketStatus>(createStatusDto);

        await _unitOfWork.TicketStatuses.AddAsync(status);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketStatusDto>(status);
    }

    public async Task<TicketStatusDto> UpdateAsync(int id, UpdateTicketStatusDto updateStatusDto)
    {
        var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
        if (status == null)
            throw new NotFoundException("Ticket status not found");

        if (!await IsStatusNameUniqueAsync(updateStatusDto.Name, id))
            throw new ValidationException("Status name already exists");

        _mapper.Map(updateStatusDto, status);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketStatusDto>(status);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var status = await _unitOfWork.TicketStatuses.GetByIdAsync(id);
        if (status == null)
            throw new NotFoundException("Ticket status not found");

        // Check if any tickets are using this status
        var ticketsCount = await _unitOfWork.Tickets.CountAsync(t => t.StatusId == id);
        if (ticketsCount > 0)
            throw new ValidationException("Cannot delete status that is being used by tickets");

        _unitOfWork.TicketStatuses.Remove(status);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> IsStatusNameUniqueAsync(string name, int? excludeStatusId = null)
    {
        return await _unitOfWork.TicketStatuses.IsStatusNameUniqueAsync(name, excludeStatusId);
    }

    public async Task<int> GetTicketCountByStatusAsync(int statusId)
    {
        return await _unitOfWork.TicketStatuses.GetTicketCountByStatusAsync(statusId);
    }
}