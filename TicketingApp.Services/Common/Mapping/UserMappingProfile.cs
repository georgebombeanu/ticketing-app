// TicketingApp.Services/Common/Mapping/UserMappingProfile.cs
using AutoMapper;
using TicketingApp.Models.Entities;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Common.Mapping;

public class UserMappingProfile : Profile
{
    public UserMappingProfile()
    {
        // User -> UserDto
        CreateMap<User, UserDto>();

        // CreateUserDto -> User
        CreateMap<CreateUserDto, User>()
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.Ignore())
            .ForMember(dest => dest.LastLogin, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedTickets, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTickets, opt => opt.Ignore());

        // UpdateUserDto -> User
        CreateMap<UpdateUserDto, User>()
            .ForMember(dest => dest.Email, opt => opt.Ignore())
            .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.LastLogin, opt => opt.Ignore())
            .ForMember(dest => dest.UserRoles, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedTickets, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTickets, opt => opt.Ignore());

        // UserRole -> UserRoleDto
        CreateMap<UserRole, UserRoleDto>()
            .ForMember(dest => dest.RoleName, opt => opt.MapFrom(src => src.Role.Name))
            .ForMember(
                dest => dest.DepartmentName,
                opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : null)
            )
            .ForMember(
                dest => dest.TeamName,
                opt => opt.MapFrom(src => src.Team != null ? src.Team.Name : null)
            );

        // CreateUserRoleDto -> UserRole
        CreateMap<CreateUserRoleDto, UserRole>()
            .ForMember(dest => dest.AssignedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
            .ForMember(dest => dest.Role, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Team, opt => opt.Ignore());
    }
}
