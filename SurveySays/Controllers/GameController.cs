using Microsoft.AspNetCore.Mvc;
using SurveySays.Repositories;
using System;
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
	}
}