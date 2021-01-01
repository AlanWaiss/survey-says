using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using System;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public class CosmosGameRepository : CosmosRepository<Game>, IGameRepository
	{
		public CosmosGameRepository( Container container )
			: base( container )
		{
		}

		public override async Task SaveAsync( Game game )
		{
			if( string.IsNullOrWhiteSpace( game.Id ) )
			{
				game.Id = Guid.NewGuid().ToString().ToLower();
				await Container.CreateItemAsync( game, new PartitionKey( game.GroupId ) );
			}
			else
				await Container.ReplaceItemAsync( game, game.Id, new PartitionKey( game.GroupId ) );
		}
	}
}
