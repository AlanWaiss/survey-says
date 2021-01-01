using System;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ignore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonProperty = Newtonsoft.Json.JsonPropertyAttribute;

namespace SurveySays.Models
{
	public class Game
	{
		[JsonProperty( "answers" )]
		[JsonPropertyName( "answers" )]
		[Required]
		public SurveyAnswer[] Answers { get; set; }

		[JsonProperty( "groupId" )]
		[JsonPropertyName( "groupId" )]
		[Required]
		public string GroupId { get; set; }

		[JsonProperty( "hostId" )]
		[JsonPropertyName( "hostId" )]
		[Required]
		public string HostId { get; set; }

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		public string Id { get; set; }

		[JsonProperty( "name" )]
		[JsonPropertyName( "name" )]
		[Required]
		public string Name { get; set; }

		[JsonProperty( "passcode" )]
		[JsonPropertyName( "passcode" )]
		public string Passcode { get; set; }

		[JsonProperty( "playerId" )]
		[JsonPropertyName( "playerId" )]
		public string PlayerId { get; set; }

		[JsonProperty( "question" )]
		[JsonPropertyName( "question" )]
		[Required]
		public string Question { get; set; }

		[JsonProperty( "surveyId" )]
		[JsonPropertyName( "surveyId" )]
		[Required]
		public string SurveyId { get; set; }

		[JsonProperty( "winnerId" )]
		[JsonPropertyName( "winnerId" )]
		public string WinnerId { get; set; }
	}
}
