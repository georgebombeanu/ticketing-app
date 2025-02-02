// TicketingApp.Services/Common/Mapping/TeamMappingProfile.cs
using AutoMapper;
using TicketingApp.Models.Entities;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Common.Mapping;

public class TeamMappingProfile : Profile
{
    public TeamMappingProfile()
    {
        // Team -> TeamDto
        CreateMap<Team, TeamDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name));

        // Team -> TeamDetailsDto
        CreateMap<Team, TeamDetailsDto>()
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(
                dest => dest.Users,
                opt => opt.MapFrom(src => src.UserRoles.Select(ur => ur.User))
            )
            .ForMember(
                dest => dest.ActiveTicketsCount,
                opt => opt.MapFrom(src => src.Tickets.Count(t => !t.ClosedAt.HasValue))
            );

        // CreateTeamDto -> Team
        CreateMap<CreateTeamDto, Team>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        // UpdateTeamDto -> Team
        CreateMap<UpdateTeamDto, Team>()
            .ForMember(dest => dest.DepartmentId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());
    }
}
