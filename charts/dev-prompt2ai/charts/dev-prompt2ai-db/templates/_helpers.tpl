{{/*
Expand the name of the chart.
*/}}
{{- define "dev-prompt2ai-db.name" -}}
{{-  printf "%s" .Chart.Name }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "dev-prompt2ai-db.fullname" -}}
{{- $name := printf "%s" .Chart.Name }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "dev-prompt2ai-db.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "dev-prompt2ai-db.labels" -}}
helm.sh/chart: {{ include "dev-prompt2ai-db.chart" . }}
{{ include "dev-prompt2ai-db.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "dev-prompt2ai-db.selectorLabels" -}}
app.kubernetes.io/name: {{ include "dev-prompt2ai-db.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "dev-prompt2ai-db.serviceAccountName" -}}
{{- "default" }}
{{- end }}