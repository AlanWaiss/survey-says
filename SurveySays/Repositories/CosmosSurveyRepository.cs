using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public class CosmosSurveyRepository : CosmosRepository<Survey>, ISurveyRepository
	{
		public CosmosSurveyRepository( Container container )
			: base( container )
		{
		}

		public override async Task SaveAsync( Survey survey )
		{
			if( string.IsNullOrWhiteSpace( survey.Id ) )
			{
				survey.Id = Guid.NewGuid().ToString().ToLower();
				await Container.CreateItemAsync( survey, new PartitionKey( survey.GroupId ) );
			}
			else
				await Container.ReplaceItemAsync( survey, survey.Id, new PartitionKey( survey.GroupId ) );
		}
	}
}