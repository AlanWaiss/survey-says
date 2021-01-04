using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using SurveySays.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public class CosmosGameRepository : CosmosRepository<Game>, IGameRepository
	{
		private ISecureHashGenerator SecureHashGenerator { get; }

		public CosmosGameRepository( Container container, ISecureHashGenerator secureHashGenerator )
			: base( container )
		{
			SecureHashGenerator = secureHashGenerator ?? throw new ArgumentNullException( nameof( secureHashGenerator ) );
		}

		public override async Task SaveAsync( Game game )
		{
			if( string.IsNullOrWhiteSpace( game.HostId ) )
				throw new ArgumentException( "HostId cannot be blank.", nameof( game ) );

			if( string.IsNullOrWhiteSpace( game.Id ) )
			{
				game.Id = Guid.NewGuid().ToString().ToLower();
				game.SecurityHash = SecureHashGenerator.GenerateHash( game.Id, game.HostId );

				await Container.CreateItemAsync( game, new PartitionKey( game.GroupId ) );
			}
			else
			{
				SecureHashGenerator.Validate( game, () => nameof( game ) );

				await Container.ReplaceItemAsync( game, game.Id, new PartitionKey( game.GroupId ) );
			}
		}

		public async Task<List<Game>> SearchAsync( string groupId, string surveyId, string hostId )
		{
			if( string.IsNullOrWhiteSpace( groupId ) )
				throw new ArgumentNullException( nameof( groupId ) );

			var query = new CosmosQueryBuilder( @"SELECT *
FROM c" );

			var filters = new List<string>();

			if( !string.IsNullOrWhiteSpace( surveyId ) )
			{
				filters.Add( "c.surveyId = @surveyId" );
				query.AddParameter( "@surveyId", surveyId.ToLower() );
			}

			if( !string.IsNullOrWhiteSpace( hostId ) )
			{
				filters.Add( "c.hostId = @hostId" );
				query.AddParameter( "@hostId", hostId.ToLower() );
			}

			if( filters.Count > 0 )
			{
				query.Query += @"
WHERE " + string.Join( " AND ", filters );
			}

			var iterator = Container.GetItemQueryIterator<Game>( query.Build(),
				requestOptions: new QueryRequestOptions
				{
					PartitionKey = new PartitionKey( groupId.ToLower() )
				} );

			var games = new List<Game>();

			while( iterator.HasMoreResults )
			{
				var response = await iterator.ReadNextAsync();
				games.AddRange( response.Resource );
			}

			return games;
		}
	}
}
