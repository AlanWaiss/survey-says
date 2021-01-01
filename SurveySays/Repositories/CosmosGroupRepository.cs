using Microsoft.Azure.Cosmos;
using SurveySays.Models;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	/// <summary>
	/// Note that the "groupId" parameter refers to the region. Use "usa" for now.
	/// </summary>
	public class CosmosGroupRepository : CosmosRepository<Group>, IGroupRepository, IRepository<Group>
	{
		public CosmosGroupRepository( Container container )
			: base( container )
		{
		}

		public override async Task SaveAsync( Group group )
		{
			await Container.UpsertItemAsync( group, new PartitionKey( group.Region ) );
		}
	}
}