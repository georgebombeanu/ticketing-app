using AutoMapper;
using TicketingApp.Models.Entities;
using TicketingApp.Services.DTOs;

namespace TicketingApp.Services.Common.Mapping;

public class FAQMappingProfile : Profile
{
    public FAQMappingProfile()
    {
        // FAQCategory mappings
        CreateMap<FAQCategory, FAQCategoryDto>();

        CreateMap<CreateFAQCategoryDto, FAQCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.FAQItems, opt => opt.Ignore());

        CreateMap<UpdateFAQCategoryDto, FAQCategory>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.FAQItems, opt => opt.Ignore());

        // FAQItem mappings
        CreateMap<FAQItem, FAQItemDto>()
            .ForMember(dest => dest.CreatedByName,
                opt => opt.MapFrom(src => src.CreatedBy != null ?
                    $"{src.CreatedBy.FirstName} {src.CreatedBy.LastName}" : string.Empty));

        CreateMap<CreateFAQItemDto, FAQItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedById, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())   // Set in service
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())   // Set in service
            .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true))
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());

        CreateMap<UpdateFAQItemDto, FAQItem>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CategoryId, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedById, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore()) // Set in service
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedBy, opt => opt.Ignore());
    }
}