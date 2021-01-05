using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	/// <summary>
	/// Note that the "groupId" parameter refers to the language. Use "en" for now.
	/// </summary>
	public class CosmosGroupRepository : CosmosRepository<Group>, IGroupRepository, IRepository<Group>
	{
		public CosmosGroupRepository( Container container )
			: base( container )
		{
		}

		public async Task<List<Group>> ListAsync( string lang )
		{
			var iterator = Container.GetItemQueryIterator<Group>( new QueryDefinition( "SELECT * FROM c WHERE c.type > 0" ),
				requestOptions: new QueryRequestOptions
				{
					PartitionKey = new PartitionKey( lang.ToLower() )
				} );

			var groups = new List<Group>();

			while( iterator.HasMoreResults )
			{
				var response = await iterator.ReadNextAsync();
				groups.AddRange( response.Resource );
			}

			return groups;
		}

		public override async Task SaveAsync( Group group )
		{
			await Container.UpsertItemAsync( group, new PartitionKey( group.Language ) );
		}
	}
}