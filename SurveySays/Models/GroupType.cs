using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SurveySays.Models
{
	public enum GroupType : byte
	{
		/// <summary>
		/// Invite-only (specify Hosts and Members).
		/// </summary>
		Private = 0,

		/// <summary>
		/// Anyone can view, but only hosts can create (specify Hosts).
		/// </summary>
		View = 1,

		/// <summary>
		/// Anyone can join and create games.
		/// </summary>
		Public = 3,
	}
}
