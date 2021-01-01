using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public interface IRepository<T>
	{
		/// <summary>
		/// Delete the item from the Cosmos container.
		/// </summary>
		/// <param name="groupId"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task DeleteAsync( string groupId, string id );

		/// <summary>
		/// Gets an item from the Cosmos container.
		/// </summary>
		/// <param name="groupId"></param>
		/// <param name="id"></param>
		/// <returns></returns>
		Task<T> GetAsync( string groupId, string id );

		/// <summary>
		/// Saves the item to the cosmos container.
		/// </summary>
		/// <param name="data"></param>
		/// <returns></returns>
		Task SaveAsync( T data );
	}
}
