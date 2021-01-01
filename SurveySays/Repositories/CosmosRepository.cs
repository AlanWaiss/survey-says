using Microsoft.Azure.Cosmos;
using System;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public abstract class CosmosRepository<T> : IRepository<T>
	{
		protected Container Container { get; }

		public CosmosRepository( Container container )
		{
			Container = container ?? throw new ArgumentNullException( nameof( container ) );
		}

		public async Task DeleteAsync( string groupId, string id )
		{
			await Container.DeleteItemAsync<T>( id, new PartitionKey( groupId ) );
		}

		public async Task<T> GetAsync( string groupId, string id )
		{
			try
			{
				var response = await Container.ReadItemAsync<T>( id, new PartitionKey( groupId ) );
				return response.Resource;
			}
			catch( CosmosException cx ) when( cx.StatusCode == System.Net.HttpStatusCode.NotFound )
			{
				return default;
			}
		}

		public abstract Task SaveAsync( T data );
	}
}