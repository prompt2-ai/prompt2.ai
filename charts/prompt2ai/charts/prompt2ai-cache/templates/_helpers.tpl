{{/*
Expand the name of the chart.
*/}}
{{- define "prompt2ai-cache.name" -}}
{{-  printf "%s" .Chart.Name }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "prompt2ai-cache.fullname" -}}
{{- $name := printf "%s" .Chart.Name }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "prompt2ai-cache.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "prompt2ai-cache.labels" -}}
helm.sh/chart: {{ include "prompt2ai-cache.chart" . }}
{{ include "prompt2ai-cache.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "prompt2ai-cache.selectorLabels" -}}
app.kubernetes.io/name: {{ include "prompt2ai-cache.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "prompt2ai-cache.serviceAccountName" -}}
{{- "default" }}
{{- end }}