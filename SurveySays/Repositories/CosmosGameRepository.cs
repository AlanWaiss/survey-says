using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public class CosmosGameRepository : CosmosRepository<Game>, IGameRepository
	{
		public CosmosGameRepository( Container container )
			: base( container )
		{
		}

		public async Task<List<Game>> GetGamesAsync( string groupId, string surveyId, string hostId )
		{
			var query = Container.GetItemQueryIterator<Game>( new QueryDefinition( @"SELECT *
FROM c
WHERE c.surveyId = @surveyId
	AND c.hostId = @hostId" )
				.WithParameter( "@surveyId", surveyId.ToLower() )
				.WithParameter( "@hostId", hostId.ToLower() ),
				requestOptions: new QueryRequestOptions
				{
					PartitionKey = new PartitionKey( groupId.ToLower() )
				} );

			var games = new List<Game>();

			while( query.HasMoreResults )
			{
				var response = await query.ReadNextAsync();
				games.AddRange( response.Resource );
			}

			return games;
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
