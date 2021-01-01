using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using SurveySays.Models;
using SurveySays.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays.Hubs
{
	public class GameHub : Hub
	{
		public static class Method
		{
			public const string GameUpdate = "gameUpdate";
		}

		private IGameRepository GameRepository { get; }

		public GameHub( IGameRepository gameRepository )
		{
			GameRepository = gameRepository ?? throw new ArgumentNullException( nameof( gameRepository ) );
		}

		[Authorize]
		public async Task GameUpdate( Game game )
		{
			await GameRepository.SaveAsync( game );
			await Clients.Group( game.Id ).SendAsync( Method.GameUpdate, game );
		}

		public async Task JoinGame( JoinGameRequest request )
		{
			var game = await GameRepository.GetAsync( request.GroupId, request.Id );
			if( game == null )
				return;	//TODO: Notify/error?

			//TODO: Hash?
			if( !string.IsNullOrWhiteSpace( game.Passcode ) && game.Passcode != request.Passcode )
				return;	//TODO: Notify/error?

			await Groups.AddToGroupAsync( Context.ConnectionId, request.Id );
			await Clients.Caller.SendAsync( Method.GameUpdate, game );
		}

		public async Task LeaveGame( JoinGameRequest request )
		{
			await Groups.RemoveFromGroupAsync( Context.ConnectionId, request.Id );
		}
	}
}