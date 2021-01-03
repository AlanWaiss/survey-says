using SurveySays.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays.Repositories
{
	public interface IGameRepository : IRepository<Game>
	{
		Task<List<Game>> SearchAsync( string groupId, string surveyId, string hostId );
	}
}
