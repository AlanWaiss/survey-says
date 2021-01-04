using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using SurveySays.Security;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public class CosmosSurveyRepository : CosmosRepository<Survey>, ISurveyRepository
	{
		private ISecureHashGenerator SecureHashGenerator { get; }

		public CosmosSurveyRepository( Container container, ISecureHashGenerator secureHashGenerator )
			: base( container )
		{
			SecureHashGenerator = secureHashGenerator ?? throw new ArgumentNullException( nameof( secureHashGenerator ) );
		}

		public override async Task SaveAsync( Survey survey )
		{
			if( string.IsNullOrWhiteSpace( survey.Id ) )
			{
				survey.Id = Guid.NewGuid().ToString().ToLower();
				survey.SecurityHash = SecureHashGenerator.GenerateHash( survey.Id, survey.HostId );

				await Container.CreateItemAsync( survey, new PartitionKey( survey.GroupId ) );
			}
			else
			{
				SecureHashGenerator.Validate( survey, () => nameof( survey ) );

				await Container.ReplaceItemAsync( survey, survey.Id, new PartitionKey( survey.GroupId ) );
			}
		}

		public async Task<List<Survey>> SearchAsync( string groupId, string hostId )
		{
			if( string.IsNullOrWhiteSpace( groupId ) )
				throw new ArgumentNullException( nameof( groupId ) );

			var query = new CosmosQueryBuilder( @"SELECT *
FROM c" );

			var filters = new List<string>();

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

			var iterator = Container.GetItemQueryIterator<Survey>( query.Build(),
				requestOptions: new QueryRequestOptions
				{
					PartitionKey = new PartitionKey( groupId.ToLower() )
				} );

			var surveys = new List<Survey>();

			while( iterator.HasMoreResults )
			{
				var response = await iterator.ReadNextAsync();
				surveys.AddRange( response.Resource );
			}

			return surveys;
		}
	}
}