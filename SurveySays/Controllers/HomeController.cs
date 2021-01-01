using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays.Controllers
{
	public class HomeController : Controller
	{
		[HttpGet, Route( "" ), Route( "play/{groupId?}/{gameId?}" )]
		public IActionResult Index( string groupId = null, string gameId = null )
		{
			return View();
		}
	}
}
