public record FAQCategoryDto(
    int Id,
    string Name,
    string Description,
    bool IsActive,
    ICollection<FAQItemDto> FAQItems
);

public record FAQItemDto(
    int Id,
    int CategoryId,
    string Question,
    string Answer,
    int CreatedById,
    string CreatedByName,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    bool IsActive
);

public record CreateFAQCategoryDto(string Name, string Description);

public record UpdateFAQCategoryDto(string Name, string Description, bool IsActive);

public record CreateFAQItemDto(int CategoryId, string Question, string Answer);

public record UpdateFAQItemDto(string Question, string Answer, bool IsActive);
