from django.http import HttpResponse
from django.shortcuts import render

# Create your views here.


def hehe(response):
    return HttpResponse("{goodDay: 'kind sir'}")