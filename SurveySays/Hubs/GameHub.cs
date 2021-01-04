using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Identity.Web;
using SurveySays.Models;
using SurveySays.Repositories;
using SurveySays.Security;
using System;
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

		private ISecureHashGenerator SecureHashGenerator { get; }

		public GameHub( IGameRepository gameRepository, ISecureHashGenerator secureHashGenerator )
		{
			GameRepository = gameRepository ?? throw new ArgumentNullException( nameof( gameRepository ) );
			SecureHashGenerator = secureHashGenerator ?? throw new ArgumentNullException( nameof( secureHashGenerator ) );
		}

		[Authorize]
		public async Task GameUpdate( Game game )
		{
			if( game.HostId != Context.User.GetObjectId() )
				return; //TODO: Notify/error?

			if( !SecureHashGenerator.IsValidHash( game ) )
				return; //TODO: Notify/error?

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