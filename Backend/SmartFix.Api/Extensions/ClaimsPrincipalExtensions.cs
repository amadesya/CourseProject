// SmartFix.Api/Extensions/ClaimsPrincipalExtensions.cs
using System.Security.Claims;

namespace SmartFix.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var value = user.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                   ?? user.FindFirst("id")?.Value;

        if (int.TryParse(value, out var id))
            return id;

        throw new InvalidOperationException("User ID не найден в токене");
    }
}