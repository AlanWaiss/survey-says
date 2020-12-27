using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace SurveySays.Pages
{
    public class IndexModel : PageModel
    {
		public string RoomName { get; set; }

        public void OnGet( string room = null )
        {
			RoomName = room;
        }
    }
}