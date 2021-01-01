using Microsoft.AspNetCore.Mvc;
using SurveySays.Repositories;
using System;
using System.Threading.Tasks;

namespace SurveySays.Controllers
{
	[ApiController]
	[Route( "api/[controller]" )]
	public class GroupController : ControllerBase
	{
		private IGroupRepository GroupRepository { get; }

		public GroupController( IGroupRepository groupRepository )
		{
			GroupRepository = groupRepository ?? throw new ArgumentNullException( nameof( groupRepository ) );
		}

		[HttpGet, Route( "{groupId}" )]
		public async Task<IActionResult> Get( string groupId )
		{
			var group = await GroupRepository.GetAsync( "usa", groupId );
			if( group == null )
				return NotFound();

			return Ok( group );
		}
	}
}