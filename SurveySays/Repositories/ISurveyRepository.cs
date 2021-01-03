using SurveySays.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public interface ISurveyRepository : IRepository<Survey>
	{
		Task<List<Survey>> SearchAsync( string groupId, string hostId );
	}
}