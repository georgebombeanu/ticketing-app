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
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.PriorityName, opt => opt.MapFrom(src => src.Priority.Name))
            .ForMember(dest => dest.StatusName, opt => opt.MapFrom(src => src.Status.Name))
            .ForMember(
                dest => dest.CreatedByName,
                opt => opt.MapFrom(src => $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}")
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
            .ForMember(dest => dest.DepartmentName, opt => opt.MapFrom(src => src.Department.Name))
            .ForMember(
                dest => dest.TeamName,
                opt => opt.MapFrom(src => src.Team != null ? src.Team.Name : null)
            );

        CreateMap<CreateTicketDto, Ticket>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow))
            .ForMember(dest => dest.StatusId, opt => opt.Ignore()); // Should be set in service

        CreateMap<UpdateTicketDto, Ticket>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow));
    }
}

public class TicketCommentMappingProfile : Profile
{
    public TicketCommentMappingProfile()
    {
        CreateMap<TicketComment, TicketCommentDto>()
            .ForMember(
                dest => dest.UserName,
                opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}")
            );

        CreateMap<CreateTicketCommentDto, TicketComment>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow));
    }
}

public class TicketAttachmentMappingProfile : Profile
{
    public TicketAttachmentMappingProfile()
    {
        CreateMap<TicketAttachment, TicketAttachmentDto>()
            .ForMember(
                dest => dest.UserName,
                opt => opt.MapFrom(src => $"{src.User.FirstName} {src.User.LastName}")
            );

        CreateMap<CreateTicketAttachmentDto, TicketAttachment>()
            .ForMember(dest => dest.UploadedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow));
    }
}

public class TicketCategoryMappingProfile : Profile
{
    public TicketCategoryMappingProfile()
    {
        CreateMap<TicketCategory, TicketCategoryDto>();
        CreateMap<CreateTicketCategoryDto, TicketCategory>();
        CreateMap<UpdateTicketCategoryDto, TicketCategory>();
    }
}

public class TicketPriorityMappingProfile : Profile
{
    public TicketPriorityMappingProfile()
    {
        CreateMap<TicketPriority, TicketPriorityDto>();
        CreateMap<CreateTicketPriorityDto, TicketPriority>();
        CreateMap<UpdateTicketPriorityDto, TicketPriority>();
    }
}

public class TicketStatusMappingProfile : Profile
{
    public TicketStatusMappingProfile()
    {
        CreateMap<TicketStatus, TicketStatusDto>();
        CreateMap<CreateTicketStatusDto, TicketStatus>();
        CreateMap<UpdateTicketStatusDto, TicketStatus>();
    }
}

public class FAQMappingProfile : Profile
{
    public FAQMappingProfile()
    {
        CreateMap<FAQCategory, FAQCategoryDto>();
        CreateMap<CreateFAQCategoryDto, FAQCategory>();
        CreateMap<UpdateFAQCategoryDto, FAQCategory>();

        CreateMap<FAQItem, FAQItemDto>()
            .ForMember(
                dest => dest.CreatedByName,
                opt => opt.MapFrom(src => $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}")
            );
        CreateMap<CreateFAQItemDto, FAQItem>()
            .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow))
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow))
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));
        CreateMap<UpdateFAQItemDto, FAQItem>()
            .ForMember(dest => dest.UpdatedAt, opt => opt.MapFrom(src => System.DateTime.UtcNow));
    }
}
