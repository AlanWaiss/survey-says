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

		[HttpGet, Route( "{lang?}" )]
		public async Task<IActionResult> Get( string lang = "en" )
		{
			var group = await GroupRepository.ListAsync( lang ?? "en" );
			if( group == null )
				return NotFound();

			return Ok( group );
		}

		[HttpGet, Route( "{lang?}/{groupId}" )]
		public async Task<IActionResult> Get( string lang, string groupId )
		{
			var group = await GroupRepository.GetAsync( lang ?? "en", groupId );
			if( group == null )
				return NotFound();

			return Ok( group );
		}
	}
}