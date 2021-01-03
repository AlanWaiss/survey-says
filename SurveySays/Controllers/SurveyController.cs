using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using SurveySays.Models;
using SurveySays.Repositories;
using System;
using System.Net;
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

		[HttpGet, Route( "{groupId}" )]
		public async Task<IActionResult> GetSurveys( string groupId, [FromQuery( Name = "host" )] string hostId )
		{
			var survey = await SurveyRepository.SearchAsync( groupId, hostId );
			if( survey == null )
				return NotFound();

			return Ok( survey );
		}

		[Authorize]
		[HttpPut, Route( "{groupId}" )]
		public async Task<IActionResult> Post( string groupId, Survey survey )
		{
			if( string.IsNullOrWhiteSpace( groupId ) )
				return BadRequest( "Missing groupId." );

			if( survey == null )
				return BadRequest( "Missing survey data." );

			if( !ModelState.IsValid )
				return BadRequest( ModelState );

			if( string.IsNullOrWhiteSpace( survey.GroupId ) || survey.GroupId.Equals( groupId, StringComparison.OrdinalIgnoreCase ) )
				survey.GroupId = groupId.ToLower();
			else
				return BadRequest( "Invalid groupId." );

			if( !string.IsNullOrWhiteSpace( survey.Id ) )
				return BadRequest( "You may not set the Id." );

			survey.HostId = User.GetObjectId().ToLower();

			await SurveyRepository.SaveAsync( survey );

			return Created( Request.Path + "/" + WebUtility.UrlEncode( survey.Id ), survey );
		}

		[Authorize]
		[HttpPut, Route( "{groupId}/{surveyId}" )]
		public async Task<IActionResult> Put( string groupId, string surveyId, Survey survey )
		{
			if( string.IsNullOrWhiteSpace( groupId ) )
				return BadRequest( "Missing groupId." );

			if( survey == null )
				return BadRequest( "Missing survey data." );

			if( !ModelState.IsValid )
				return BadRequest( ModelState );

			if( string.IsNullOrWhiteSpace( survey.GroupId ) || survey.GroupId.Equals( groupId, StringComparison.OrdinalIgnoreCase ) )
				survey.GroupId = groupId.ToLower();
			else
				return BadRequest( "Invalid groupId." );

			if( string.IsNullOrWhiteSpace( surveyId ) )
				return BadRequest( "Missing surveyId." );

			if( string.IsNullOrWhiteSpace( survey.Id ) || survey.Id.Equals( surveyId, StringComparison.OrdinalIgnoreCase ) )
				survey.Id = surveyId.ToLower();
			else
				return BadRequest( "Invalid surveyId." );

			await SurveyRepository.SaveAsync( survey );

			return Ok( survey );
		}
	}
}