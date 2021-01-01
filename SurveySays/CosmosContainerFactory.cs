using Microsoft.Azure.Cosmos;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays
{
	public class CosmosContainerFactory
	{
		private CosmosClientFactory ClientFactory { get; }

		public CosmosContainerFactory( CosmosClientFactory clientFactory )
		{
			ClientFactory = clientFactory ?? throw new ArgumentNullException( nameof( clientFactory ) );
		}

		public Container GetContainer( CosmosContainerOptions options )
		{
			if( options == null )
				throw new ArgumentNullException( nameof( options ) );
			if( string.IsNullOrWhiteSpace( options.ConnectionString ) )
				throw new ArgumentException( "Invalid CosmosContainerOptions: No ConnectionString", nameof( options ) );

			var client = ClientFactory.GetClient( options.ConnectionString );
			return client.GetContainer( options.DatabaseId, options.ContainerId );
		}
	}
}