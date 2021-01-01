using Microsoft.AspNetCore.Mvc;
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

		[HttpPut, Route( "{groupId}" )]
		public async Task<IActionResult> Post( string groupId, Survey survey )
		{
			if( !ModelState.IsValid )
				return BadRequest( ModelState );

			if( string.IsNullOrWhiteSpace( groupId ) )
				return BadRequest( "Missing groupId." );

			if( string.IsNullOrWhiteSpace( survey.GroupId ) )
				survey.GroupId = groupId;
			else if( !survey.GroupId.Equals( groupId, StringComparison.OrdinalIgnoreCase ) )
				return BadRequest( "Invalid groupId." );

			if( !string.IsNullOrWhiteSpace( survey.Id ) )
				return BadRequest( "You may not set the Id." );

			await SurveyRepository.SaveAsync( survey );

			return Created( Request.Path + "/" + WebUtility.UrlEncode( survey.Id ), survey );
		}

		[HttpPut, Route( "{groupId}/{surveyId}" )]
		public async Task<IActionResult> Put( string groupId, string surveyId, Survey survey )
		{
			if( !ModelState.IsValid )
				return BadRequest( ModelState );

			if( string.IsNullOrWhiteSpace( groupId ) )
				return BadRequest( "Missing groupId." );

			if( string.IsNullOrWhiteSpace( survey.GroupId ) )
				survey.GroupId = groupId;
			else if( !survey.GroupId.Equals( groupId, StringComparison.OrdinalIgnoreCase ) )
				return BadRequest( "Invalid groupId." );

			if( string.IsNullOrWhiteSpace( surveyId ) )
				return BadRequest( "Missing surveyId." );

			if( string.IsNullOrWhiteSpace( survey.Id ) )
				survey.Id = surveyId;
			else if( !survey.Id.Equals( surveyId, StringComparison.OrdinalIgnoreCase ) )
				return BadRequest( "Invalid surveyId." );

			await SurveyRepository.SaveAsync( survey );

			return Ok( survey );
		}
	}
}