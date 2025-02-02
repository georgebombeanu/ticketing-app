// TicketingApp.Services/Common/Mapping/DepartmentMappingProfile.cs
using AutoMapper;
using TicketingApp.Models.Entities;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Common.Mapping;

public class DepartmentMappingProfile : Profile
{
    public DepartmentMappingProfile()
    {
        // Department -> DepartmentDto
        CreateMap<Department, DepartmentDto>();

        // Department -> DepartmentSummaryDto
        CreateMap<Department, DepartmentSummaryDto>();

        // Department -> DepartmentDetailsDto
        CreateMap<Department, DepartmentDetailsDto>()
            .ForMember(
                dest => dest.Users,
                opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.User))
            )
            .ForMember(
                dest => dest.ActiveTicketsCount,
                opt => opt.MapFrom(src => src.Tickets.Count(t => !t.ClosedAt.HasValue))
            );

        // CreateDepartmentDto -> Department
        CreateMap<CreateDepartmentDto, Department>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Teams, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        // UpdateDepartmentDto -> Department
        CreateMap<UpdateDepartmentDto, Department>()
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Teams, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        // Team -> TeamSummaryDto
        CreateMap<Team, TeamSummaryDto>();

        // User -> UserSummaryDto
        CreateMap<User, UserSummaryDto>();
    }
}
