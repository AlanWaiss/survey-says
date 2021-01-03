using Microsoft.Azure.Cosmos;
using System.Collections.Generic;

namespace SurveySays
{
	public class CosmosQueryBuilder
	{
		public Dictionary<string, object> Parameters { get; } = new Dictionary<string, object>();

		public string Query { get; set; }

		public CosmosQueryBuilder()
		{
		}

		public CosmosQueryBuilder( string query )
		{
			Query = query;
		}

		/// <summary>
		/// Adds a parameter.
		/// </summary>
		/// <param name="name">The name of the parameter (e.g. @param1). If the same name is added again, it will replace the value.</param>
		/// <param name="value">The value of the parameter.</param>
		/// <returns></returns>
		public CosmosQueryBuilder AddParameter( string name, object value )
		{
			Parameters[ name ] = value;
			return this;
		}

		public QueryDefinition Build()
		{
			var query = new QueryDefinition( Query );

			foreach( var parameter in Parameters )
				query = query.WithParameter( parameter.Key, parameter.Value );

			return query;
		}
	}
}
