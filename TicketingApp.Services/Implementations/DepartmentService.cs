using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using TicketingApp.DataAccess;
using TicketingApp.Models.Entities;
using TicketingApp.Services.Common.Exceptions;
using TicketingApp.Services.DTOs;
using TicketingApp.Services.Interfaces;

namespace TicketingApp.Services.Implementations;

public class DepartmentService : IDepartmentService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public DepartmentService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<DepartmentDto> GetByIdAsync(int id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null || !department.IsActive)
            throw new NotFoundException("Department not found");

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDetailsDto> GetDetailsByIdAsync(int id)
    {
        var department = await _unitOfWork.Departments.GetDepartmentWithTeamsAsync(id);
        if (department == null || !department.IsActive)
            throw new NotFoundException("Department not found");

        var departmentWithUsers = await _unitOfWork.Departments.GetDepartmentWithUsersAsync(id);

        // Combine the data
        department.UserRoles = departmentWithUsers.UserRoles;

        return _mapper.Map<DepartmentDetailsDto>(department);
    }

    public async Task<IEnumerable<DepartmentDto>> GetAllActiveAsync()
    {
        var departments = await _unitOfWork.Departments.GetActiveDepartmentsAsync();
        return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto createDepartmentDto)
    {
        if (!await IsDepartmentNameUniqueAsync(createDepartmentDto.Name))
            throw new ValidationException("Department name already exists");

        var department = _mapper.Map<Department>(createDepartmentDto);

        await _unitOfWork.Departments.AddAsync(department);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto updateDepartmentDto)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null || !department.IsActive)
            throw new NotFoundException("Department not found");

        if (!await IsDepartmentNameUniqueAsync(updateDepartmentDto.Name, id))
            throw new ValidationException("Department name already exists");

        _mapper.Map(updateDepartmentDto, department);
        await _unitOfWork.CompleteAsync();

        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<bool> DeactivateAsync(int id)
    {
        var department = await _unitOfWork.Departments.GetByIdAsync(id);
        if (department == null)
            throw new NotFoundException("Department not found");

        department.IsActive = false;
        await _unitOfWork.CompleteAsync();

        return true;
    }

    public async Task<IEnumerable<DepartmentSummaryDto>> GetDepartmentsByUserIdAsync(int userId)
    {
        var departments = await _unitOfWork.Departments.GetDepartmentsByUserIdAsync(userId);
        return _mapper.Map<IEnumerable<DepartmentSummaryDto>>(departments);
    }

    public async Task<bool> IsDepartmentNameUniqueAsync(
        string name,
        int? excludeDepartmentId = null
    )
    {
        return await _unitOfWork.Departments.IsDepartmentNameUniqueAsync(name, excludeDepartmentId);
    }
}
