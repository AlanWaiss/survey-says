using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays.Controllers
{
	[Authorize]
	public class HostController : Controller
	{
		[HttpGet, Route( "host/{groupId?}/{surveyId?}/{gameId?}" )]
		public IActionResult Index( string groupId = null, string surveyId = null, string gameId = null )
		{
			return View();
		}
	}
}
