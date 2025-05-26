using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TicketPriorityService : ITicketPriorityService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TicketPriorityService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TicketPriorityDto> GetByIdAsync(int id)
    {
        var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
        if (priority == null)
            throw new NotFoundException("Ticket priority not found");

        return _mapper.Map<TicketPriorityDto>(priority);
    }

    public async Task<IEnumerable<TicketPriorityDto>> GetAllAsync()
    {
        var priorities = await _unitOfWork.TicketPriorities.GetAllAsync();
        return _mapper.Map<IEnumerable<TicketPriorityDto>>(priorities);
    }

    public async Task<IEnumerable<TicketPriorityDto>> GetAllOrderedByNameAsync()
    {
        var priorities = await _unitOfWork.TicketPriorities.GetAllOrderedByNameAsync();
        return _mapper.Map<IEnumerable<TicketPriorityDto>>(priorities);
    }

    public async Task<TicketPriorityDto> CreateAsync(CreateTicketPriorityDto createPriorityDto)
    {
        if (!await IsPriorityNameUniqueAsync(createPriorityDto.Name))
            throw new ValidationException("Priority name already exists");

        var priority = _mapper.Map<TicketPriority>(createPriorityDto);

        await _unitOfWork.TicketPriorities.AddAsync(priority);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketPriorityDto>(priority);
    }

    public async Task<TicketPriorityDto> UpdateAsync(int id, UpdateTicketPriorityDto updatePriorityDto)
    {
        var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
        if (priority == null)
            throw new NotFoundException("Ticket priority not found");

        if (!await IsPriorityNameUniqueAsync(updatePriorityDto.Name, id))
            throw new ValidationException("Priority name already exists");

        _mapper.Map(updatePriorityDto, priority);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketPriorityDto>(priority);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var priority = await _unitOfWork.TicketPriorities.GetByIdAsync(id);
        if (priority == null)
            throw new NotFoundException("Ticket priority not found");

        // Check if any tickets are using this priority
        var ticketsCount = await _unitOfWork.Tickets.CountAsync(t => t.PriorityId == id);
        if (ticketsCount > 0)
            throw new ValidationException("Cannot delete priority that is being used by tickets");

        _unitOfWork.TicketPriorities.Remove(priority);
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> IsPriorityNameUniqueAsync(string name, int? excludePriorityId = null)
    {
        return await _unitOfWork.TicketPriorities.IsPriorityNameUniqueAsync(name, excludePriorityId);
    }
}