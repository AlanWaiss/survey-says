using Microsoft.AspNetCore.Mvc;

namespace SurveySays.Controllers
{
	[ApiController]
	[Route( ".well-known" )]
	public class WellKnownController : Controller
	{
		[HttpGet, Route( "microsoft-identity-association.json" )]
		public ContentResult MicrosoftIdentityAssociation()
		{
			return new ContentResult
			{
				Content = @"{
  ""associatedApplications"": [
    {
      ""applicationId"": ""87cda53d-6016-4c98-921b-e1a18c7fd529""
    }
  ]
}",
				ContentType = "application/json"
			};
		}
	}
}