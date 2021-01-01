using SurveySays.Models;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public interface IGroupRepository
	{
		/// <summary>
		/// Delete the group from the Cosmos container.
		/// </summary>
		/// <param name="region"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task DeleteAsync( string region, string id );

		/// <summary>
		/// Gets a group from the Cosmos container.
		/// </summary>
		/// <param name="region"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task<Group> GetAsync( string region, string id );

		/// <summary>
		/// Save the group.
		/// </summary>
		/// <param name="group"></param>
		/// <returns></returns>
		Task SaveAsync( Group group );
	}
}
