#nullable enable

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace Gabp.Schemas
{
    /// <summary>
    /// Accesses the versioned GABP schema assets embedded in this package.
    /// </summary>
    public static class SchemaAssets
    {
        public const string CurrentVersion = "1.0";

        private static readonly Assembly Assembly = typeof(SchemaAssets).Assembly;
        private static readonly Lazy<IReadOnlyDictionary<string, string>> ResourceMap =
            new Lazy<IReadOnlyDictionary<string, string>>(CreateResourceMap);

        public static IReadOnlyList<string> ListPaths()
        {
            return ResourceMap.Value.Keys
                .OrderBy(static path => path, StringComparer.Ordinal)
                .ToArray();
        }

        public static bool Exists(string path)
        {
            return ResourceMap.Value.ContainsKey(NormalizePath(path));
        }

        public static Stream Open(string path)
        {
            var normalized = NormalizePath(path);
            if (!ResourceMap.Value.TryGetValue(normalized, out var resourceName))
            {
                throw new FileNotFoundException("Schema asset not found.", normalized);
            }

            var stream = Assembly.GetManifestResourceStream(resourceName);
            if (stream == null)
            {
                throw new FileNotFoundException("Embedded schema asset could not be opened.", normalized);
            }

            return stream;
        }

        public static string ReadAllText(string path)
        {
            using (var stream = Open(path))
            using (var reader = new StreamReader(stream))
            {
                return reader.ReadToEnd();
            }
        }

        private static IReadOnlyDictionary<string, string> CreateResourceMap()
        {
            var resources = new Dictionary<string, string>(StringComparer.Ordinal);
            foreach (var resourceName in Assembly.GetManifestResourceNames())
            {
                var normalized = NormalizeManifestResourceName(resourceName);
                if (normalized == null)
                {
                    continue;
                }

                resources[normalized] = resourceName;
            }

            return resources;
        }

        private static string NormalizePath(string path)
        {
            if (path == null)
            {
                throw new ArgumentNullException(nameof(path));
            }

            var normalized = path.Replace('\\', '/').TrimStart('/');
            if (normalized.Length == 0)
            {
                throw new ArgumentException("Schema path cannot be empty.", nameof(path));
            }

            if (!normalized.StartsWith(CurrentVersion + "/", StringComparison.Ordinal))
            {
                normalized = CurrentVersion + "/" + normalized;
            }

            return normalized;
        }

        private static string? NormalizeManifestResourceName(string resourceName)
        {
            if (resourceName.StartsWith(CurrentVersion + "/", StringComparison.Ordinal))
            {
                return resourceName;
            }

            var marker = "." + CurrentVersion + ".";
            var markerIndex = resourceName.IndexOf(marker, StringComparison.Ordinal);
            if (markerIndex < 0)
            {
                return null;
            }

            var tail = resourceName.Substring(markerIndex + marker.Length);
            if (tail.StartsWith("common.", StringComparison.Ordinal))
            {
                return CurrentVersion + "/common/" + tail.Substring("common.".Length);
            }

            if (tail.StartsWith("methods.", StringComparison.Ordinal))
            {
                return CurrentVersion + "/methods/" + tail.Substring("methods.".Length);
            }

            if (tail.StartsWith("events.", StringComparison.Ordinal))
            {
                return CurrentVersion + "/events/" + tail.Substring("events.".Length);
            }

            return CurrentVersion + "/" + tail;
        }
    }
}
