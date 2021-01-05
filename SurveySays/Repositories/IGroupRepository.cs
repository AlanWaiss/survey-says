using SurveySays.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public interface IGroupRepository
	{
		/// <summary>
		/// Delete the group from the Cosmos container.
		/// </summary>
		/// <param name="lang"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task DeleteAsync( string lang, string id );

		/// <summary>
		/// Gets a group from the Cosmos container.
		/// </summary>
		/// <param name="lang"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task<Group> GetAsync( string lang, string id );

		/// <summary>
		/// List all the groups.
		/// </summary>
		/// <returns></returns>
		Task<List<Group>> ListAsync( string lang );

		/// <summary>
		/// Save the group.
		/// </summary>
		/// <param name="group"></param>
		/// <returns></returns>
		Task SaveAsync( Group group );
	}
}
