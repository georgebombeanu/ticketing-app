// TicketingApp.Services/Common/Mapping/MappingProfiles.cs
using AutoMapper;
using TicketingApp.Models.Entities;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Common.Mapping;

public class TicketMappingProfile : Profile
{
    public TicketMappingProfile()
    {
        CreateMap<Ticket, TicketDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : string.Empty))
            .ForMember(dest => dest.PriorityName, opt => opt.MapFrom(src => src.Priority != null ? src.Priority.Name : string.Empty))
            .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status != null ? src.Status.Name : string.Empty))
            .ForMember(
                dest => dest.CreatedByName,
                opt => opt.MapFrom(src => src.CreatedBy != null ? $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : string.Empty)
            )
            .ForMember(
                dest => dest.AssignedToName,
                opt =>
                    opt.MapFrom(src =>
                        src.AssignedTo != null
                            ? $"{src.AssignedTo.FirstName} {src.AssignedTo.LastName}"
                            : null
                    )
            )
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department != null ? src.Department.Name : string.Empty))
            .ForMember(
                dest => dest.TeamName,
                opt => opt.MapFrom(src => src.Team != null ? src.Team.Name : null)
            )
            .ForMember(dest => dest.Comments, opt => opt.MapFrom(src => src.Comments ?? new List<TicketComment>()))
            .ForMember(dest => dest.Attachments, opt => opt.MapFrom(src => src.Attachments ?? new List<TicketAttachment>()));

        CreateMap<CreateTicketDto, Ticket>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.StatusId, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.CreatedById, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.ClosedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Priority, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Team, opt => opt.Ignore())
            .ForMember(dest => dest.Comments, opt => opt.Ignore())
            .ForMember(dest => dest.Attachments, opt => opt.Ignore())
            .ForMember(dest => dest.Feedback, opt => opt.Ignore());

        CreateMap<UpdateTicketDto, Ticket>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.CreatedById, opt => opt.Ignore())
            .ForMember(dest => dest.ClosedAt, opt => opt.Ignore())
            .ForMember(dest => dest.DepartmentId, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Priority, opt => opt.Ignore())
            .ForMember(dest => dest.Status, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore())
            .ForMember(dest => dest.AssignedTo, opt => opt.Ignore())
            .ForMember(dest => dest.Department, opt => opt.Ignore())
            .ForMember(dest => dest.Team, opt => opt.Ignore())
            .ForMember(dest => dest.Comments, opt => opt.Ignore())
            .ForMember(dest => dest.Attachments, opt => opt.Ignore())
            .ForMember(dest => dest.Feedback, opt => opt.Ignore());
    }
}

public class TicketCommentMappingProfile : Profile
{
    public TicketCommentMappingProfile()
    {
        CreateMap<TicketComment, TicketCommentDto>()
            .ForMember(
                dest => dest.UserName,
                opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty)
            );

        CreateMap<CreateTicketCommentDto, TicketComment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.Ticket, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
    }
}

public class TicketAttachmentMappingProfile : Profile
{
    public TicketAttachmentMappingProfile()
    {
        CreateMap<TicketAttachment, TicketAttachmentDto>()
            .ForMember(
                dest => dest.UserName,
                opt => opt.MapFrom(src => src.User != null ? $"{src.User.FirstName} {src.User.LastName}" : string.Empty)
            );

        CreateMap<CreateTicketAttachmentDto, TicketAttachment>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.UploadedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.UserId, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.Ticket, opt => opt.Ignore())
            .ForMember(dest => dest.User, opt => opt.Ignore());
    }
}

public class TicketCategoryMappingProfile : Profile
{
    public TicketCategoryMappingProfile()
    {
        CreateMap<TicketCategory, TicketCategoryDto>();

        CreateMap<CreateTicketCategoryDto, TicketCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        CreateMap<UpdateTicketCategoryDto, TicketCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());
    }
}

public class TicketPriorityMappingProfile : Profile
{
    public TicketPriorityMappingProfile()
    {
        CreateMap<TicketPriority, TicketPriorityDto>();

        CreateMap<CreateTicketPriorityDto, TicketPriority>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        CreateMap<UpdateTicketPriorityDto, TicketPriority>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());
    }
}

public class TicketStatusMappingProfile : Profile
{
    public TicketStatusMappingProfile()
    {
        CreateMap<TicketStatus, TicketStatusDto>();

        CreateMap<CreateTicketStatusDto, TicketStatus>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());

        CreateMap<UpdateTicketStatusDto, TicketStatus>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.Tickets, opt => opt.Ignore());
    }
}