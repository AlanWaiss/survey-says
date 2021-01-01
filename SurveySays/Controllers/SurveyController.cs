using Microsoft.AspNetCore.Mvc;
using SurveySays.Repositories;
using System;
using System.Threading.Tasks;

namespace SurveySays.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class SurveyController : ControllerBase
	{
		private ISurveyRepository SurveyRepository { get; }

		public SurveyController( ISurveyRepository surveyRepository )
		{
			SurveyRepository = surveyRepository ?? throw new ArgumentNullException( nameof( surveyRepository ) );
		}

		[HttpGet, Route( "{groupId}/{surveyId}" )]
		public async Task<IActionResult> Get( string groupId, string surveyId )
		{
			var survey = await SurveyRepository.GetAsync( groupId, surveyId );
			if( survey == null )
				return NotFound();

			return Ok( survey );
		}
	}
}