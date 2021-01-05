using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using Ignore = Newtonsoft.Json.JsonIgnoreAttribute;
using JsonProperty = Newtonsoft.Json.JsonPropertyAttribute;

namespace SurveySays.Models
{
	public class Group
	{
		[Ignore, JsonIgnore]
		private List<string> hosts;

		/// <summary>
		/// A list of the users that can create surveys and games within this group.
		/// </summary>
		[JsonProperty( "hosts" )]
		[JsonPropertyName( "hosts" )]
		public List<string> Hosts
		{
			get => hosts ??= new List<string>();
			set => hosts = value;
		}

		[JsonProperty( "id" )]
		[JsonPropertyName( "id" )]
		public string Id { get; set; }

		[Ignore, JsonIgnore]
		private string lang;

		/// <summary>
		/// Used as the partition key
		/// </summary>
		[JsonProperty( "lang" )]
		[JsonPropertyName( "lang" )]
		public string Language
		{
			get => lang ??= "en";
			set => lang = value?.ToLower();
		}

		[Ignore, JsonIgnore]
		private List<string> members;

		/// <summary>
		/// For private groups, lists the members of this group.
		/// </summary>
		[JsonProperty( "members" )]
		[JsonPropertyName( "members" )]
		public List<string> Members
		{
			get => members ??= new List<string>();
			set => members = value;
		}

		[JsonProperty( "name" )]
		[JsonPropertyName( "name" )]
		public string Name { get; set; }

		[JsonProperty( "text" )]
		[JsonPropertyName( "text" )]
		public string Text { get; set; }

		[JsonProperty( "type" )]
		[JsonPropertyName( "type" )]
		public GroupType Type { get; set; }
	}
}
