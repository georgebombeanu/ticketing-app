using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class TicketCategoryService : ITicketCategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public TicketCategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<TicketCategoryDto> GetByIdAsync(int id)
    {
        var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException("Ticket category not found");

        return _mapper.Map<TicketCategoryDto>(category);
    }

    public async Task<IEnumerable<TicketCategoryDto>> GetAllAsync()
    {
        var categories = await _unitOfWork.TicketCategories.GetAllAsync();
        return _mapper.Map<IEnumerable<TicketCategoryDto>>(categories);
    }

    public async Task<IEnumerable<TicketCategoryDto>> GetActiveAsync()
    {
        var categories = await _unitOfWork.TicketCategories.GetActiveCategories();
        return _mapper.Map<IEnumerable<TicketCategoryDto>>(categories);
    }

    public async Task<TicketCategoryDto> CreateAsync(CreateTicketCategoryDto createCategoryDto)
    {
        if (!await IsCategoryNameUniqueAsync(createCategoryDto.Name))
            throw new ValidationException("Category name already exists");

        var category = _mapper.Map<TicketCategory>(createCategoryDto);
        category.IsActive = true;

        await _unitOfWork.TicketCategories.AddAsync(category);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketCategoryDto>(category);
    }

    public async Task<TicketCategoryDto> UpdateAsync(int id, UpdateTicketCategoryDto updateCategoryDto)
    {
        var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException("Ticket category not found");

        if (!await IsCategoryNameUniqueAsync(updateCategoryDto.Name, id))
            throw new ValidationException("Category name already exists");

        _mapper.Map(updateCategoryDto, category);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<TicketCategoryDto>(category);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var category = await _unitOfWork.TicketCategories.GetByIdAsync(id);
        if (category == null)
            throw new NotFoundException("Ticket category not found");

        category.IsActive = false;
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<bool> IsCategoryNameUniqueAsync(string name, int? excludeCategoryId = null)
    {
        return await _unitOfWork.TicketCategories.IsCategoryNameUniqueAsync(name, excludeCategoryId);
    }
}