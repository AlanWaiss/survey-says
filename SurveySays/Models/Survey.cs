using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ignore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonProperty = Newtonsoft.Json.JsonPropertyAttribute;

namespace SurveySays.Models
{
	public class Survey : ISecureObject
	{
		[Ignore]
		[JsonIgnore]
		private List<SurveyAnswer> answers;

		[JsonProperty( "answers" )]
		[JsonPropertyName( "answers" )]
		public List<SurveyAnswer> Answers
		{
			get => answers ??= new List<SurveyAnswer>();
			set => answers = value;
		}

		[JsonProperty( "groupId" )]
		[JsonPropertyName( "groupId" )]
		[Required]
		public string GroupId { get; set; }

		[JsonProperty( "hostId" )]
		[JsonPropertyName( "hostId" )]
		public string HostId { get; set; }

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		public string Id { get; set; }

		[JsonProperty( "question" )]
		[JsonPropertyName( "question" )]
		[Required]
		public string Question { get; set; }

		[JsonProperty( "hash" )]
		[JsonPropertyName( "hash" )]
		public string SecurityHash { get; set; }
	}
}