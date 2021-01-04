using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using SurveySays.Models;
using System;

namespace SurveySays.Security
{
	public static class SecurityExtensions
	{
		public static string GenerateHash( this ISecureHashGenerator secureHashGenerator, string id, string hostId )
		{
			if( string.IsNullOrWhiteSpace( id ) )
				throw new ArgumentNullException( nameof( id ) );
			if( string.IsNullOrWhiteSpace( hostId ) )
				throw new ArgumentNullException( nameof( hostId ) );

			return secureHashGenerator.GenerateHash( id + ":" + hostId );
		}

		public static bool IsValidHash( this ISecureHashGenerator secureHashGenerator, ISecureObject secureObject )
		{
			if( string.IsNullOrWhiteSpace( secureObject.SecurityHash ) || string.IsNullOrWhiteSpace( secureObject.Id ) || string.IsNullOrWhiteSpace( secureObject.HostId ) )
				return false;

			return secureObject.SecurityHash == secureHashGenerator.GenerateHash( secureObject.Id, secureObject.HostId );
		}

		public static IServiceCollection UseSecureHashGenerator( this IServiceCollection services, IConfiguration configuration ) => services
			.Configure<SecureHashOptions>( configuration.GetSection( SecureHashOptions.SectionName ) )
			.AddSingleton<ISecureHashGenerator, SecureHashGenerator>();

		public static void Validate( this ISecureHashGenerator secureHashGenerator, ISecureObject secureObject, Func<string> getParamName = null )
		{
			if( string.IsNullOrWhiteSpace( secureObject.Id ) )
				throw new ArgumentException( "Id cannot be blank.", getParamName?.Invoke() ?? nameof( secureObject ) );

			if( string.IsNullOrWhiteSpace( secureObject.HostId ) )
				throw new ArgumentException( "HostId cannot be blank.", getParamName?.Invoke() ?? nameof( secureObject ) );

			if( string.IsNullOrWhiteSpace( secureObject.SecurityHash ) )
				throw new ArgumentException( "SecurityHash cannot be blank.", getParamName?.Invoke() ?? nameof( secureObject ) );

			if( secureObject.SecurityHash != secureHashGenerator.GenerateHash( secureObject.Id, secureObject.HostId ) )
				throw new ArgumentException( "Invalid SecurityHash.", getParamName?.Invoke() ?? nameof( secureObject ) );
		}
	}
}