using Newtonsoft.Json;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SurveySays.Models
{
	public class JoinGameRequest
	{
		[JsonProperty( "groupId" )]
		[JsonPropertyName( "groupId" )]
		[Required]
		public string GroupId { get; set; }

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		[Required]
		public string Id { get; set; }

		[JsonProperty( "passcode" )]
		[JsonPropertyName( "passcode" )]
		public string Passcode { get; set; }
	}
}