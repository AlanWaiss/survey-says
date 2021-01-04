using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Web;
using SurveySays.Models;
using SurveySays.Repositories;
using SurveySays.Security;
using System;
using System.Net;
using System.Threading.Tasks;

namespace SurveySays.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class GameController : ControllerBase
	{
		private IGameRepository GameRepository { get; }

		public GameController( IGameRepository gameRepository )
		{
			GameRepository = gameRepository ?? throw new ArgumentNullException( nameof( gameRepository ) );
		}

		[HttpGet, Route( "{groupId}/{gameId}")]
		public async Task<IActionResult> Get( string groupId, string gameId )
		{
			var game = await GameRepository.GetAsync( groupId, gameId );
			if( game == null )
				return NotFound();

			return Ok( game );
		}

		[HttpGet, Route( "{groupId}" )]
		public async Task<IActionResult> GetGames( string groupId, [FromQuery( Name = "survey" )] string surveyId, [FromQuery( Name = "host" )] string hostId )
		{
			var survey = await GameRepository.SearchAsync( groupId, surveyId, hostId );
			if( survey == null )
				return NotFound();

			return Ok( survey );
		}

		[Authorize]
		[HttpPost, Route( "{groupId}" )]
		public async Task<IActionResult> Post( string groupId, Game game )
		{
			if( string.IsNullOrWhiteSpace( groupId ) )
				return BadRequest( "Invalid groupId." );

			if( game == null )
				return BadRequest( "Missing game data." );

			if( !ModelState.IsValid )
				return BadRequest( ModelState );

			if( string.IsNullOrWhiteSpace( game.GroupId ) || game.GroupId.Equals( groupId, StringComparison.OrdinalIgnoreCase ) )
				game.GroupId = groupId.ToLower();
			else
				return BadRequest( "Invalid groupId." );

			game.HostId = User.GetObjectId();

			await GameRepository.SaveAsync( game );

			return Created( Request.Path + "/" + WebUtility.UrlEncode( game.Id ), game );
		}
	}
}