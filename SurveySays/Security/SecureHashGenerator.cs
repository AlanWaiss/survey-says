using Microsoft.Extensions.Options;
using System;
using System.Security.Cryptography;
using System.Text;

namespace SurveySays.Security
{
	public sealed class SecureHashGenerator : ISecureHashGenerator, IDisposable
	{
		private string Key { get; }

		private SHA256 SHA { get; }

		public SecureHashGenerator( IOptions<SecureHashOptions> options )
		{
			if( options == null )
				throw new ArgumentNullException( nameof( options ) );
			if( string.IsNullOrWhiteSpace( options.Value.Key ) )
				throw new ArgumentException( "SecureHash:Key is not configured.", nameof( options ) );

			Key = options.Value.Key;
			SHA = SHA256.Create();
		}

		public void Dispose()
		{
			SHA.Dispose();
			GC.SuppressFinalize( this );
		}

		public string GenerateHash( string input )
		{
			if( string.IsNullOrWhiteSpace( input ) )
				throw new ArgumentNullException( nameof( input ) );

			var hash = SHA.ComputeHash( Encoding.UTF8.GetBytes( Key + ":" + input ) );

			return Convert.ToBase64String( hash );
		}
	}
}