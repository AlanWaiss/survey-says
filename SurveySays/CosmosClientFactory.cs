using Microsoft.Azure.Cosmos;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;

namespace SurveySays
{
	public class CosmosClientFactory
	{
		private Dictionary<string, CosmosClient> Clients { get; } = new Dictionary<string, CosmosClient>();

		private IConfiguration Configuration { get; }

		public CosmosClientFactory( IConfiguration configuration )
		{
			Configuration = configuration;
		}

		public CosmosClient GetClient( string connectionString )
		{
			if( string.IsNullOrWhiteSpace( connectionString ) )
				throw new ArgumentNullException( nameof( connectionString ) );

			if( connectionString.IndexOf( "=" ) == -1 )
			{
				//Name of a connection string
				connectionString = Configuration.GetConnectionString( connectionString );
			}

			if( Clients.TryGetValue( connectionString, out var client ) )
				return client;

			return Clients[ connectionString ] = new CosmosClient( connectionString );
		}
	}
}